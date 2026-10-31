export interface GmailTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

export interface SendGmailEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  agencyId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  logId?: string;
  skipLogging?: boolean;
}

export interface GmailSendResult {
  messageId: string;
  threadId?: string;
  to: string;
  from: string;
  subject: string;
  sentAt: string;
}

export interface EmailStatusData {
  connected: boolean;
  senderEmail: string;
  scope: string;
  redirectUri: string;
  tokenSource: 'database' | 'environment' | 'none';
  tokenExpiresAt: string | null;
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  encryptionKeyConfigured?: boolean;
  tokenEncrypted?: boolean;
  isAgencyDedicated?: boolean;
  agencyId?: string | null;
  activeTransport: 'GMAIL_API' | 'RESEND' | 'SANDBOX_FALLBACK';
}
