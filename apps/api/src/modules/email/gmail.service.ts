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
import { EmailDeliveryStatus } from '@grand-bandhan/shared';

export const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GMAIL_SEND_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

export class GmailService {
  /**
   * Generates a cryptographically secure OAuth 2.0 authorization URL
   * with CSRF protection state persisted to Neon PostgreSQL.
   */
  public static async generateAuthUrl(userId?: string, agencyId?: string): Promise<{ url: string; state: string }> {
    const envValidation = validateGmailEnv();
    if (!envValidation.isValid) {
      throw new Error(`Google OAuth environment variables missing: ${envValidation.missing.join(', ')}`);
    }

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
   * Validates OAuth state nonce against Neon PostgreSQL (CSRF Prevention)
   * and consumes the nonce so it cannot be reused.
   */
  public static async validateAndConsumeState(state: string): Promise<boolean> {
    if (!state || typeof state !== 'string') {
      return false;
    }

    const record = await prisma.oAuthState.findUnique({
      where: { state },
    });

    if (!record) {
      return false;
    }

    // Delete state immediately to prevent replay attacks
    await prisma.oAuthState.delete({
      where: { id: record.id },
    }).catch(() => {});

    // Check expiration
    if (new Date() > record.expiresAt) {
      return false;
    }

    return true;
  }

  /**
   * Exchanges authorization code for tokens, persisting refresh token to Neon PostgreSQL.
   */
  public static async exchangeCodeForTokens(code: string): Promise<GmailTokenResponse> {
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

    // Persist refresh token to Neon DB
    const refreshToken = response.refresh_token || env.GMAIL_REFRESH_TOKEN;
    if (refreshToken) {
      const expiryDate = response.expires_in
        ? new Date(Date.now() + response.expires_in * 1000)
        : new Date(Date.now() + 3600 * 1000);

      await prisma.gmailOAuthToken.upsert({
        where: { id: 'default' },
        update: {
          refreshToken,
          accessToken: response.access_token,
          expiryDate,
          senderEmail: env.GMAIL_SENDER_EMAIL,
          scope: response.scope || GMAIL_SCOPE,
          updatedAt: new Date(),
        },
        create: {
          id: 'default',
          refreshToken,
          accessToken: response.access_token,
          expiryDate,
          senderEmail: env.GMAIL_SENDER_EMAIL,
          scope: response.scope || GMAIL_SCOPE,
        },
      });
    }

    return response;
  }

  /**
   * Retrieves a valid access token. Re-uses non-expired token or refreshes via refresh_token.
   */
  public static async getValidAccessToken(): Promise<string> {
    // 1. Check Neon PostgreSQL for existing token record
    let tokenRecord = await prisma.gmailOAuthToken.findUnique({
      where: { id: 'default' },
    });

    // Fallback: If not in DB yet but GMAIL_REFRESH_TOKEN exists in env, initialize record
    if (!tokenRecord && env.GMAIL_REFRESH_TOKEN) {
      tokenRecord = await prisma.gmailOAuthToken.create({
        data: {
          id: 'default',
          refreshToken: env.GMAIL_REFRESH_TOKEN,
          senderEmail: env.GMAIL_SENDER_EMAIL,
          scope: GMAIL_SCOPE,
        },
      });
    }

    if (!tokenRecord || !tokenRecord.refreshToken) {
      throw new Error(
        'Gmail OAuth is not connected. Please connect via /api/email/oauth/start or configure GMAIL_REFRESH_TOKEN.'
      );
    }

    // 2. Check if access token is cached and not expired (with 2-minute safety window)
    const safetyWindowMs = 2 * 60 * 1000;
    if (
      tokenRecord.accessToken &&
      tokenRecord.expiryDate &&
      tokenRecord.expiryDate.getTime() - safetyWindowMs > Date.now()
    ) {
      return tokenRecord.accessToken;
    }

    // 3. Refresh the access token using refresh_token
    const postData = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: tokenRecord.refreshToken,
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

    // Update Neon DB cache
    await prisma.gmailOAuthToken.update({
      where: { id: 'default' },
      data: {
        accessToken: refreshResponse.access_token,
        expiryDate: newExpiry,
        ...(refreshResponse.refresh_token ? { refreshToken: refreshResponse.refresh_token } : {}),
      },
    });

    return refreshResponse.access_token;
  }

  /**
   * Constructs an RFC 2822 MIME message and sends via Gmail API messages.send.
   */
  public static async sendEmail(params: SendGmailEmailParams): Promise<GmailSendResult> {
    const accessToken = await this.getValidAccessToken();
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
      // Log failure in Neon DB EmailLog
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
      }).catch(() => {});

      throw new Error(`Gmail API sending failed: ${apiError.message}`);
    }

    const messageId = response.id || `gmail_${Date.now()}`;

    // 4. Record successful dispatch in Neon PostgreSQL EmailLog
    await prisma.emailLog.create({
      data: {
        agencyId: params.agencyId || null,
        recipientEmail: params.to,
        eventType: 'GMAIL_API_SEND',
        subject: params.subject,
        templateName: 'GMAIL_API',
        status: EmailDeliveryStatus.DELIVERED,
        providerMessageId: messageId,
        sentAt: new Date(),
        relatedEntityType: params.relatedEntityType || null,
        relatedEntityId: params.relatedEntityId || null,
      },
    }).catch(() => {});

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
   * Inspects current status without leaking credentials or tokens.
   */
  public static async getStatus(): Promise<EmailStatusData> {
    const tokenRecord = await prisma.gmailOAuthToken.findUnique({
      where: { id: 'default' },
    });

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

    return {
      connected,
      senderEmail: tokenRecord?.senderEmail || env.GMAIL_SENDER_EMAIL,
      scope: tokenRecord?.scope || GMAIL_SCOPE,
      redirectUri: env.GOOGLE_REDIRECT_URI,
      tokenSource,
      tokenExpiresAt: tokenRecord?.expiryDate ? tokenRecord.expiryDate.toISOString() : null,
      clientIdConfigured: Boolean(env.GOOGLE_CLIENT_ID),
      clientSecretConfigured: Boolean(env.GOOGLE_CLIENT_SECRET),
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
