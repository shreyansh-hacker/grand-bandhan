import https from 'https';
import { prisma } from '@grand-bandhan/database';
import { NotificationEvent, NotificationPayload } from './notification.types';
import { renderEmailTemplate } from './email-templates';
import { EmailDeliveryStatus } from '@grand-bandhan/shared';

export class NotificationService {
  /**
   * Dispatch a business domain event, render the branded template,
   * log to the Neon database outbox, and send via transactional email provider.
   */
  public static async emit(event: NotificationEvent, payload: NotificationPayload): Promise<void> {
    try {
      const template = renderEmailTemplate(event, payload.data);
      const subject = payload.subject || template.subject;

      // 1. Log to Neon PostgreSQL EmailLog (Transactional Outbox)
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
            relatedEntityType: payload.relatedEntityType || null,
            relatedEntityId: payload.relatedEntityId || null,
          },
        });
      } catch (dbErr) {
        console.warn('[NotificationService] Could not write to EmailLog table:', dbErr);
      }

      // 2. Dispatch via Transactional Provider (Resend or Sandbox Fallback)
      const apiKey = process.env.EMAIL_API_KEY;
      const fromEmail = process.env.EMAIL_FROM || 'Grand Bandhan Concierge <onboarding@resend.dev>';

      if (apiKey && apiKey.startsWith('re_')) {
        // Send via Resend REST API
        await this.sendViaResend({
          apiKey,
          from: fromEmail,
          to: payload.recipientEmail,
          subject,
          html: template.html,
          logId: logRecord?.id,
        });
      } else {
        // Console / Mock Sandbox Mode
        console.log(`\n=============================================================`);
        console.log(`📧 [EMAIL NOTIFICATION EMITTED] Event: ${event}`);
        console.log(`To: ${payload.recipientName} <${payload.recipientEmail}>`);
        console.log(`Subject: ${subject}`);
        console.log(`Provider: Local Sandbox Log (No EMAIL_API_KEY configured)`);
        console.log(`=============================================================\n`);

        if (logRecord?.id) {
          await prisma.emailLog.update({
            where: { id: logRecord.id },
            data: {
              status: EmailDeliveryStatus.SENT,
              providerMessageId: `sandbox_${Date.now()}`,
              sentAt: new Date(),
            },
          }).catch(() => {});
        }
      }
    } catch (err: any) {
      console.error('[NotificationService] Uncaught error during dispatch:', err.message);
    }
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
                      status: EmailDeliveryStatus.DELIVERED,
                      providerMessageId: parsed.id,
                      sentAt: new Date(),
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
