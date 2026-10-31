import https from 'https';
import { prisma } from '@grand-bandhan/database';
import { NotificationEvent, NotificationPayload } from './notification.types';
import { renderEmailTemplate } from './email-templates';
import { EmailDeliveryStatus } from '@grand-bandhan/shared';

export class NotificationService {
  /**
   * Dispatch a business domain event with full outbox persistence,
   * idempotency protection, and bounded exponential retries.
   */
  public static async emit(event: NotificationEvent, payload: NotificationPayload): Promise<{ success: boolean; logId?: string; duplicateSkipped?: boolean }> {
    try {
      // 1. Idempotency Check: Prevent duplicate sends if caller provided idempotencyKey
      if (payload.idempotencyKey) {
        const existing = await prisma.emailLog.findUnique({
          where: { idempotencyKey: payload.idempotencyKey },
        });

        if (existing) {
          if (existing.status === EmailDeliveryStatus.SENT || existing.status === EmailDeliveryStatus.PROCESSING) {
            console.log(`[NotificationService] Duplicate event skipped via idempotencyKey: ${payload.idempotencyKey}`);
            return { success: true, logId: existing.id, duplicateSkipped: true };
          }
        }
      }

      const template = renderEmailTemplate(event, payload.data);
      const subject = payload.subject || template.subject;

      // 2. Persist Canonical Outbox Record (Status: QUEUED)
      let logRecord: any = null;
      try {
        logRecord = await prisma.emailLog.create({
          data: {
            agencyId: payload.agencyId || null,
            recipientEmail: payload.recipientEmail,
            recipientName: payload.recipientName,
            recipientRole: payload.recipientRole || null,
            eventType: event,
            subject,
            templateName: event,
            status: EmailDeliveryStatus.QUEUED,
            payload: payload.data,
            idempotencyKey: payload.idempotencyKey || null,
            relatedEntityType: payload.relatedEntityType || null,
            relatedEntityId: payload.relatedEntityId || null,
            retryCount: 0,
            maxRetries: 3,
          },
        });
      } catch (dbErr: any) {
        // If unique constraint collision on idempotencyKey, treat as duplicate
        if (dbErr.code === 'P2002' && payload.idempotencyKey) {
          console.log(`[NotificationService] Race condition idempotency collision: ${payload.idempotencyKey}`);
          return { success: true, duplicateSkipped: true };
        }
        console.warn('[NotificationService] Could not write to EmailLog table:', dbErr.message);
      }

      const logId = logRecord?.id;

      // Mark status as PROCESSING
      if (logId) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: { status: EmailDeliveryStatus.PROCESSING },
        }).catch(() => {});
      }

      // 3. Dispatch via Priority Provider: Gmail API -> Resend -> Sandbox Fallback
      let sentViaGmail = false;
      try {
        // Look up agency-specific token or fallback 'default'
        let hasGmailToken = false;
        if (payload.agencyId) {
          const agencyToken = await prisma.gmailOAuthToken.findFirst({
            where: {
              OR: [{ id: `agency_${payload.agencyId}` }, { agencyId: payload.agencyId }],
            },
          });
          if (agencyToken && agencyToken.refreshToken) {
            hasGmailToken = true;
          }
        }

        if (!hasGmailToken) {
          const defaultToken = await prisma.gmailOAuthToken.findUnique({ where: { id: 'default' } });
          if ((defaultToken && defaultToken.refreshToken) || process.env.GMAIL_REFRESH_TOKEN) {
            hasGmailToken = true;
          }
        }

        if (hasGmailToken) {
          const { GmailService } = await import('../email/gmail.service');
          const result = await GmailService.sendEmail({
            to: payload.recipientEmail,
            subject,
            html: template.html,
            text: template.text,
            agencyId: payload.agencyId,
            relatedEntityType: payload.relatedEntityType,
            relatedEntityId: payload.relatedEntityId,
            logId, // Updates canonical EmailLog directly without creating duplicate row
          });

          sentViaGmail = true;
          return { success: true, logId };
        }
      } catch (gmailErr: any) {
        console.warn('[NotificationService] Gmail API dispatch attempt failed, falling back:', gmailErr.message);

        // Record retry scheduling with exponential backoff (e.g. 1st retry in 1m, 2nd in 2m, 3rd in 4m)
        if (logId) {
          const nextRetryAt = new Date(Date.now() + 60 * 1000);
          await prisma.emailLog.update({
            where: { id: logId },
            data: {
              status: EmailDeliveryStatus.FAILED,
              errorMessage: `Gmail API: ${gmailErr.message}`,
              retryCount: { increment: 1 },
              nextRetryAt,
            },
          }).catch(() => {});
        }
      }

      if (sentViaGmail) {
        return { success: true, logId };
      }

      // 4. Secondary Fallback: Resend REST API
      const apiKey = process.env.EMAIL_API_KEY;
      const fromEmail = process.env.EMAIL_FROM || 'Grand Bandhan Concierge <onboarding@resend.dev>';

      if (apiKey && apiKey.startsWith('re_')) {
        await this.sendViaResend({
          apiKey,
          from: fromEmail,
          to: payload.recipientEmail,
          subject,
          html: template.html,
          logId,
        });
        return { success: true, logId };
      }

      // 5. Development / Sandbox Console Fallback
      console.log(`\n=============================================================`);
      console.log(`📧 [EMAIL NOTIFICATION EMITTED] Event: ${event}`);
      console.log(`To: ${payload.recipientName} <${payload.recipientEmail}>`);
      console.log(`Subject: ${subject}`);
      console.log(`Provider: Local Sandbox Log (No EMAIL_API_KEY or Gmail Token configured)`);
      console.log(`=============================================================\n`);

      if (logId) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: EmailDeliveryStatus.SENT,
            providerMessageId: `sandbox_${Date.now()}`,
            sentAt: new Date(),
            errorMessage: null,
          },
        }).catch(() => {});
      }

      return { success: true, logId };
    } catch (err: any) {
      console.error('[NotificationService] Uncaught error during dispatch:', err.message);
      return { success: false };
    }
  }

  /**
   * Re-dispatches a single failed or queued notification record safely.
   * Reconstructs the exact email from the stored event and payload.
   */
  public static async dispatchSingleLog(logId: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const log = await prisma.emailLog.findUnique({ where: { id: logId } });
    if (!log) {
      return { success: false, error: 'Notification log not found' };
    }

    if (log.retryCount >= log.maxRetries) {
      return { success: false, error: `Maximum retry limit (${log.maxRetries}) reached.` };
    }

    try {
      // Mark as PROCESSING
      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: EmailDeliveryStatus.PROCESSING,
          retryCount: { increment: 1 },
        },
      });

      const eventEnum = (log.eventType as NotificationEvent) || NotificationEvent.PROFILE_UPDATED;
      const payloadData = (log.payload as Record<string, any>) || {};
      const template = renderEmailTemplate(eventEnum, payloadData);
      const subject = log.subject || template.subject;

      const { GmailService } = await import('../email/gmail.service');
      const result = await GmailService.sendEmail({
        to: log.recipientEmail,
        subject,
        html: template.html,
        text: template.text,
        agencyId: log.agencyId || undefined,
        relatedEntityType: log.relatedEntityType || undefined,
        relatedEntityId: log.relatedEntityId || undefined,
        logId: log.id,
      });

      return { success: true, messageId: result.messageId };
    } catch (err: any) {
      const nextBackoffMs = Math.pow(2, log.retryCount) * 60 * 1000;
      const nextRetryAt = log.retryCount + 1 < log.maxRetries ? new Date(Date.now() + nextBackoffMs) : null;

      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: EmailDeliveryStatus.FAILED,
          errorMessage: err.message,
          nextRetryAt,
        },
      }).catch(() => {});

      return { success: false, error: err.message };
    }
  }

  /**
   * Scans for failed notification logs eligible for bounded retry and re-dispatches them.
   */
  public static async processPendingRetries(limit = 10): Promise<{ processed: number; succeeded: number; failed: number }> {
    const now = new Date();
    const pendingLogs = await prisma.emailLog.findMany({
      where: {
        status: EmailDeliveryStatus.FAILED,
        retryCount: { lt: 3 },
        nextRetryAt: { lte: now },
      },
      take: limit,
      orderBy: { nextRetryAt: 'asc' },
    });

    let succeeded = 0;
    let failed = 0;

    for (const log of pendingLogs) {
      const result = await this.dispatchSingleLog(log.id);
      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }
    }

    return { processed: pendingLogs.length, succeeded, failed };
  }

  private static sendViaResend(params: {
    apiKey: string;
    from: string;
    to: string;
    subject: string;
    html: string;
    logId?: string;
  }): Promise<void> {
    return new Promise((resolve) => {
      const body = JSON.stringify({
        from: params.from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      });

      const req = https.request(
        {
          hostname: 'api.resend.com',
          port: 443,
          path: '/emails',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${params.apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let responseBody = '';
          res.on('data', (chunk) => (responseBody += chunk));
          res.on('end', async () => {
            try {
              const parsed = JSON.parse(responseBody);
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                console.log(`[Resend] Email delivered successfully. Message ID: ${parsed.id}`);
                if (params.logId) {
                  await prisma.emailLog.update({
                    where: { id: params.logId },
                    data: {
                      status: EmailDeliveryStatus.SENT,
                      providerMessageId: parsed.id,
                      sentAt: new Date(),
                      errorMessage: null,
                    },
                  }).catch(() => {});
                }
              } else {
                console.warn(`[Resend] Delivery warning (${res.statusCode}):`, parsed.message);
                if (params.logId) {
                  await prisma.emailLog.update({
                    where: { id: params.logId },
                    data: {
                      status: EmailDeliveryStatus.FAILED,
                      errorMessage: parsed.message || 'Resend API returned non-200 code',
                    },
                  }).catch(() => {});
                }
              }
            } catch {
              // Non-fatal
            }
            resolve();
          });
        }
      );

      req.on('error', async (err) => {
        console.error('[Resend] Network error communicating with Resend:', err.message);
        if (params.logId) {
          await prisma.emailLog.update({
            where: { id: params.logId },
            data: {
              status: EmailDeliveryStatus.FAILED,
              errorMessage: err.message,
            },
          }).catch(() => {});
        }
        resolve();
      });

      req.write(body);
      req.end();
    });
  }
}
