import crypto from 'crypto';
import https from 'https';
import { prisma } from '@grand-bandhan/database';
import { env, validateGmailEnv } from '../../config/env';
import {
  GmailTokenResponse,
  SendGmailEmailParams,
  GmailSendResult,
  EmailStatusData,
} from './email.types';
import { encryptToken, decryptToken, isEncrypted } from './token-encryption';
import { EmailDeliveryStatus } from '@grand-bandhan/shared';

export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GMAIL_SEND_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

export interface OAuthStateRecord {
  id: string;
  state: string;
  userId: string | null;
  agencyId: string | null;
  expiresAt: Date;
}

export class GmailService {
  /**
   * Creates a short-lived (60s), single-use authorization handoff ticket.
   * This allows secure initiation of OAuth via browser redirection without
   * exposing sensitive JWTs or user credentials in URL query parameters.
   */
  public static async createHandoffTicket(
    userId: string,
    agencyId?: string
  ): Promise<{ ticket: string; expiresAt: Date }> {
    // Opportunistic cleanup of expired states
    await this.cleanupExpiredStates().catch(() => {});

    const ticket = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60-second validity

    await prisma.oAuthState.create({
      data: {
        state: `handoff_${ticket}`,
        userId,
        agencyId: agencyId || null,
        expiresAt,
      },
    });

    return { ticket, expiresAt };
  }

  /**
   * Atomically validates and consumes a handoff ticket from Neon PostgreSQL in a transaction.
   * Guarantees single-use consumption and eliminates race condition windows.
   */
  public static async validateAndConsumeHandoffTicket(
    ticket: string
  ): Promise<{ userId: string | null; agencyId: string | null } | null> {
    if (!ticket || typeof ticket !== 'string') {
      return null;
    }

    const stateKey = `handoff_${ticket}`;
    try {
      // Transactional atomic consumption in Neon PostgreSQL
      const record = await prisma.$transaction(async (tx) => {
        const row = await tx.oAuthState.findUnique({
          where: { state: stateKey },
        });
        if (!row) return null;
        await tx.oAuthState.delete({
          where: { id: row.id },
        });
        return row;
      });

      if (!record || new Date() > record.expiresAt) {
        return null;
      }

      return {
        userId: record.userId,
        agencyId: record.agencyId,
      };
    } catch {
      return null;
    }
  }

  /**
   * Generates a cryptographically secure OAuth 2.0 authorization URL
   * with CSRF protection state persisted to Neon PostgreSQL.
   */
  public static async generateAuthUrl(
    userId?: string,
    agencyId?: string
  ): Promise<{ url: string; state: string }> {
    const envValidation = validateGmailEnv();
    if (!envValidation.isValid) {
      throw new Error(`Google OAuth environment variables missing: ${envValidation.missing.join(', ')}`);
    }

    // Opportunistic cleanup of expired states
    await this.cleanupExpiredStates().catch(() => {});

    // 1. Generate CSRF state nonce
    const state = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute validity

    // 2. Persist state in Neon PostgreSQL
    await prisma.oAuthState.create({
      data: {
        state,
        userId: userId || null,
        agencyId: agencyId || null,
        expiresAt,
      },
    });

    // 3. Construct Google OAuth 2.0 URL (Offline access & force consent to ensure refresh token is returned)
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: GMAIL_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return {
      url: `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`,
      state,
    };
  }

  /**
   * Atomically validates and consumes the OAuth state nonce against Neon PostgreSQL in a transaction.
   * Guarantees single-use consumption and eliminates CSRF replay attacks.
   * Returns bound admin and agency context if valid and non-expired.
   */
  public static async validateAndConsumeState(state: string): Promise<OAuthStateRecord | null> {
    if (!state || typeof state !== 'string') {
      return null;
    }

    // Reject handoff tickets masquerading as Google OAuth state nonces
    if (state.startsWith('handoff_')) {
      return null;
    }

    try {
      // Transactional atomic consumption in Neon PostgreSQL
      const record = await prisma.$transaction(async (tx) => {
        const row = await tx.oAuthState.findUnique({
          where: { state },
        });
        if (!row) return null;
        await tx.oAuthState.delete({
          where: { id: row.id },
        });
        return row;
      });

      if (!record || new Date() > record.expiresAt) {
        return null;
      }

      return record;
    } catch {
      return null;
    }
  }

  /**
   * Cleans up expired OAuth states and abandoned handoff tickets from Neon DB.
   */
  public static async cleanupExpiredStates(): Promise<number> {
    try {
      const result = await prisma.oAuthState.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
      return result.count;
    } catch {
      return 0;
    }
  }

  /**
   * Exchanges authorization code for tokens and persists encrypted refresh/access
   * tokens to Neon PostgreSQL using AES-256-GCM authenticated envelope encryption.
   * Supports multi-tenant isolation by binding token to specific agency or global default.
   */
  public static async exchangeCodeForTokens(
    code: string,
    options?: { agencyId?: string | null; userId?: string | null }
  ): Promise<GmailTokenResponse> {
    const postData = new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString();

    const response = await this.httpPostJson<GmailTokenResponse>(GOOGLE_TOKEN_ENDPOINT, postData, {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    if (!response.access_token) {
      throw new Error('Google OAuth token exchange failed: No access_token in response');
    }

    const refreshToken = response.refresh_token || env.GMAIL_REFRESH_TOKEN;
    if (refreshToken) {
      const expiryDate = response.expires_in
        ? new Date(Date.now() + response.expires_in * 1000)
        : new Date(Date.now() + 3600 * 1000);

      // Multi-tenant keying: dedicated sender per agency or 'default' platform global sender
      const tokenId = options?.agencyId ? `agency_${options.agencyId}` : 'default';

      // Resolve sender email for the agency or default concierge
      let senderEmail = env.GMAIL_SENDER_EMAIL;
      if (options?.agencyId) {
        const agency = await prisma.agency.findUnique({
          where: { id: options.agencyId },
          select: { contactEmail: true },
        }).catch(() => null);
        if (agency?.contactEmail) {
          senderEmail = agency.contactEmail;
        }
      }

      // Encrypt tokens at rest using AES-256-GCM envelope
      const encryptedRefreshToken = encryptToken(refreshToken);
      const encryptedAccessToken = encryptToken(response.access_token);

      await prisma.gmailOAuthToken.upsert({
        where: { id: tokenId },
        update: {
          refreshToken: encryptedRefreshToken,
          accessToken: encryptedAccessToken,
          expiryDate,
          senderEmail,
          scope: response.scope || GMAIL_SCOPE,
          agencyId: options?.agencyId || null,
          updatedAt: new Date(),
        },
        create: {
          id: tokenId,
          refreshToken: encryptedRefreshToken,
          accessToken: encryptedAccessToken,
          expiryDate,
          senderEmail,
          scope: response.scope || GMAIL_SCOPE,
          agencyId: options?.agencyId || null,
        },
      });
    }

    return response;
  }

  /**
   * Retrieves a valid access token. Decrypts AES-256-GCM token from Neon PostgreSQL.
   * Automatically refreshes via refresh_token when expired.
   * Multi-tenant resolution: checks for dedicated agency sender first, then falls back to platform concierge.
   */
  /**
   * Internal helper: Decrypts cached access token or refreshes with Google OAuth endpoint.
   */
  private static async resolveAndRefreshToken(tokenRecord: any): Promise<string> {
    // Decrypt refresh token
    const plainRefreshToken = decryptToken(tokenRecord.refreshToken);

    // Check if cached access token is non-expired (with 2-minute safety window)
    const safetyWindowMs = 2 * 60 * 1000;
    if (
      tokenRecord.accessToken &&
      tokenRecord.expiryDate &&
      tokenRecord.expiryDate.getTime() - safetyWindowMs > Date.now()
    ) {
      try {
        return decryptToken(tokenRecord.accessToken);
      } catch (err: any) {
        console.warn(`[GmailService] Failed to decrypt cached accessToken for ${tokenRecord.id}:`, err.message);
      }
    }

    // Refresh the access token using decrypted refresh token
    const postData = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: plainRefreshToken,
      grant_type: 'refresh_token',
    }).toString();

    const refreshResponse = await this.httpPostJson<GmailTokenResponse>(GOOGLE_TOKEN_ENDPOINT, postData, {
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    if (!refreshResponse.access_token) {
      throw new Error('Failed to refresh Google access token: No access_token returned');
    }

    const newExpiry = refreshResponse.expires_in
      ? new Date(Date.now() + refreshResponse.expires_in * 1000)
      : new Date(Date.now() + 3600 * 1000);

    // Update Neon DB cache with encrypted tokens
    await prisma.gmailOAuthToken.update({
      where: { id: tokenRecord.id },
      data: {
        accessToken: encryptToken(refreshResponse.access_token),
        expiryDate: newExpiry,
        ...(refreshResponse.refresh_token ? { refreshToken: encryptToken(refreshResponse.refresh_token) } : {}),
      },
    });

    return refreshResponse.access_token;
  }

  /**
   * Retrieves a valid access token. Decrypts AES-256-GCM token from Neon PostgreSQL.
   * Automatically refreshes via refresh_token when expired.
   * Multi-tenant resolution: checks for dedicated agency sender first, with automatic graceful fallback
   * to platform concierge sender if agency token is invalid, expired, or corrupted.
   */
  public static async getValidAccessToken(agencyId?: string): Promise<string> {
    // 1. Check for dedicated agency sender token
    if (agencyId) {
      try {
        const agencyToken = await prisma.gmailOAuthToken.findFirst({
          where: {
            OR: [
              { id: `agency_${agencyId}` },
              { agencyId },
            ],
          },
        });
        if (agencyToken && agencyToken.refreshToken) {
          return await this.resolveAndRefreshToken(agencyToken);
        }
      } catch (err: any) {
        console.warn(`[GmailService] Dedicated token for agency ${agencyId} failed validation/refresh (${err.message}). Falling back to platform default sender.`);
      }
    }

    // 2. Global platform concierge sender token
    let defaultToken = await prisma.gmailOAuthToken.findUnique({
      where: { id: 'default' },
    });

    // 3. Fallback: If not in DB yet but GMAIL_REFRESH_TOKEN exists in env, initialize encrypted record
    if (!defaultToken && env.GMAIL_REFRESH_TOKEN) {
      defaultToken = await prisma.gmailOAuthToken.create({
        data: {
          id: 'default',
          refreshToken: encryptToken(env.GMAIL_REFRESH_TOKEN),
          senderEmail: env.GMAIL_SENDER_EMAIL,
          scope: GMAIL_SCOPE,
        },
      });
    }

    if (!defaultToken || !defaultToken.refreshToken) {
      throw new Error(
        'Gmail OAuth is not connected. Please connect via /api/email/oauth/start or configure GMAIL_REFRESH_TOKEN.'
      );
    }

    return await this.resolveAndRefreshToken(defaultToken);
  }

  /**
   * Constructs an RFC 2822 MIME message and sends via Gmail API messages.send.
   * Automatically resolves dedicated agency sender or global concierge sender.
   */
  public static async sendEmail(params: SendGmailEmailParams): Promise<GmailSendResult> {
    const accessToken = await this.getValidAccessToken(params.agencyId);
    const senderEmail = params.from || env.GMAIL_SENDER_EMAIL;

    // 1. Build RFC 2822 MIME message
    const rawMessage = this.createMimeMessage({
      from: `Grand Bandhan Concierge <${senderEmail}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    // 2. Encode to base64url format required by Gmail API
    const base64UrlMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // 3. Dispatch to Gmail API
    let response: any;
    try {
      response = await this.httpPostJson(
        GMAIL_SEND_ENDPOINT,
        JSON.stringify({ raw: base64UrlMessage }),
        {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      );
    } catch (apiError: any) {
      // Record failure on canonical outbox record if logId provided, else create standalone record
      if (params.logId) {
        await prisma.emailLog.update({
          where: { id: params.logId },
          data: {
            status: EmailDeliveryStatus.FAILED,
            errorMessage: apiError.message,
          },
        }).catch((dbErr: any) => {
          console.warn(`[GmailService] Failed to update EmailLog ${params.logId} on dispatch error:`, dbErr.message);
        });
      } else if (!params.skipLogging) {
        await prisma.emailLog.create({
          data: {
            agencyId: params.agencyId || null,
            recipientEmail: params.to,
            eventType: 'GMAIL_API_SEND',
            subject: params.subject,
            templateName: 'GMAIL_API',
            status: EmailDeliveryStatus.FAILED,
            errorMessage: apiError.message,
            relatedEntityType: params.relatedEntityType || null,
            relatedEntityId: params.relatedEntityId || null,
          },
        }).catch((dbErr: any) => {
          console.warn('[GmailService] Failed to create standalone EmailLog on dispatch error:', dbErr.message);
        });
      }

      throw new Error(`Gmail API sending failed: ${apiError.message}`);
    }

    const messageId = response.id || `gmail_${Date.now()}`;

    // 4. Record successful dispatch: Update canonical outbox record if logId is provided, else create standalone record
    if (params.logId) {
      await prisma.emailLog.update({
        where: { id: params.logId },
        data: {
          status: EmailDeliveryStatus.SENT,
          providerMessageId: messageId,
          sentAt: new Date(),
          errorMessage: null,
        },
      }).catch((dbErr: any) => {
        console.error(`[GmailService] Failed to update canonical EmailLog ${params.logId}:`, dbErr.message);
        throw new Error(`Email sent via Gmail API (ID: ${messageId}) but failed to update canonical log: ${dbErr.message}`);
      });
    } else if (!params.skipLogging) {
      await prisma.emailLog.create({
        data: {
          agencyId: params.agencyId || null,
          recipientEmail: params.to,
          eventType: 'GMAIL_API_SEND',
          subject: params.subject,
          templateName: 'GMAIL_API',
          status: EmailDeliveryStatus.SENT,
          providerMessageId: messageId,
          sentAt: new Date(),
          relatedEntityType: params.relatedEntityType || null,
          relatedEntityId: params.relatedEntityId || null,
        },
      }).catch((dbErr: any) => {
        console.warn('[GmailService] Failed to create standalone EmailLog on success:', dbErr.message);
      });
    }

    return {
      messageId,
      threadId: response.threadId,
      to: params.to,
      from: senderEmail,
      subject: params.subject,
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Inspects current status without leaking credentials, tokens, or encryption keys.
   * Reports multi-tenant sender details if agencyId is supplied.
   */
  public static async getStatus(agencyId?: string): Promise<EmailStatusData> {
    let tokenRecord = null;
    let isAgencyDedicated = false;

    if (agencyId) {
      tokenRecord = await prisma.gmailOAuthToken.findFirst({
        where: {
          OR: [
            { id: `agency_${agencyId}` },
            { agencyId },
          ],
        },
      });
      if (tokenRecord) {
        isAgencyDedicated = true;
      }
    }

    if (!tokenRecord) {
      tokenRecord = await prisma.gmailOAuthToken.findUnique({
        where: { id: 'default' },
      });
    }

    const hasDbToken = Boolean(tokenRecord?.refreshToken);
    const hasEnvToken = Boolean(env.GMAIL_REFRESH_TOKEN);
    const connected = hasDbToken || hasEnvToken;

    let tokenSource: 'database' | 'environment' | 'none' = 'none';
    if (hasDbToken) tokenSource = 'database';
    else if (hasEnvToken) tokenSource = 'environment';

    const activeTransport = connected
      ? 'GMAIL_API'
      : process.env.EMAIL_API_KEY
      ? 'RESEND'
      : 'SANDBOX_FALLBACK';

    const tokenEncrypted = tokenRecord?.refreshToken ? isEncrypted(tokenRecord.refreshToken) : false;
    const encryptionKeyConfigured = Boolean(
      process.env.GMAIL_TOKEN_ENCRYPTION_KEY ||
      process.env.GMAIL_TOKEN_ENCRYPTION_KEY_V1 ||
      env.GMAIL_TOKEN_ENCRYPTION_KEY
    );

    return {
      connected,
      isAgencyDedicated,
      agencyId: isAgencyDedicated ? agencyId || null : null,
      senderEmail: tokenRecord?.senderEmail || env.GMAIL_SENDER_EMAIL,
      scope: tokenRecord?.scope || GMAIL_SCOPE,
      redirectUri: env.GOOGLE_REDIRECT_URI,
      tokenSource,
      tokenExpiresAt: tokenRecord?.expiryDate ? tokenRecord.expiryDate.toISOString() : null,
      clientIdConfigured: Boolean(env.GOOGLE_CLIENT_ID),
      clientSecretConfigured: Boolean(env.GOOGLE_CLIENT_SECRET),
      encryptionKeyConfigured,
      tokenEncrypted,
      activeTransport,
    };
  }

  /**
   * Helper: Builds raw RFC 2822 email string.
   */
  private static createMimeMessage(data: {
    from: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): string {
    const encodedSubject = `=?UTF-8?B?${Buffer.from(data.subject).toString('base64')}?=`;
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    const lines: string[] = [
      `From: ${data.from}`,
      `To: ${data.to}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
    ];

    if (data.html) {
      lines.push(
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        data.text || data.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        data.html,
        '',
        `--${boundary}--`
      );
    } else {
      lines.push(
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        data.text || ''
      );
    }

    return lines.join('\r\n');
  }

  private static mockInterceptor:
    | ((url: string, body: string, headers: Record<string, string>) => Promise<any> | null)
    | null = null;

  public static setMockInterceptor(
    interceptor: (url: string, body: string, headers: Record<string, string>) => Promise<any> | null
  ): void {
    this.mockInterceptor = interceptor;
  }

  public static clearMockInterceptor(): void {
    this.mockInterceptor = null;
  }

  /**
   * Internal HTTPS POST helper returning parsed JSON with comprehensive error details.
   */
  private static httpPostJson<T = any>(
    url: string,
    body: string,
    headers: Record<string, string>
  ): Promise<T> {
    if (this.mockInterceptor) {
      const mockResult = this.mockInterceptor(url, body, headers);
      if (mockResult !== null) {
        return mockResult;
      }
    }

    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const reqHeaders = {
        ...headers,
        'Content-Length': Buffer.byteLength(body).toString(),
      };

      const req = https.request(
        {
          hostname: parsed.hostname,
          port: 443,
          path: parsed.pathname + parsed.search,
          method: 'POST',
          headers: reqHeaders,
        },
        (res) => {
          let rawData = '';
          res.on('data', (chunk) => (rawData += chunk));
          res.on('end', () => {
            try {
              const data = JSON.parse(rawData);
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                resolve(data as T);
              } else {
                const errorMsg =
                  data.error_description ||
                  data.error?.message ||
                  data.message ||
                  `HTTP ${res.statusCode}: ${rawData}`;
                reject(new Error(errorMsg));
              }
            } catch {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                resolve(rawData as any);
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${rawData}`));
              }
            }
          });
        }
      );

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}
