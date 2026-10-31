import { Request, Response } from 'express';
import { GmailService, GMAIL_SCOPE } from './gmail.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { env } from '../../config/env';
import { UserRole } from '@grand-bandhan/shared';
import { prisma } from '@grand-bandhan/database';

/**
 * Creates a short-lived (60s), single-use authorization handoff ticket
 * for initiating browser-based OAuth without leaking JWTs in URLs.
 * POST /api/email/oauth/handoff
 */
export async function createOAuthHandoffTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const agencyId = req.user?.agencyId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required to generate OAuth handoff ticket.',
      });
      return;
    }

    const { ticket, expiresAt } = await GmailService.createHandoffTicket(userId, agencyId);

    res.json({
      success: true,
      message: 'Single-use OAuth authorization handoff ticket generated.',
      data: {
        ticket,
        expiresAt: expiresAt.toISOString(),
        startUrl: `/api/email/oauth/start?ticket=${ticket}`,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create OAuth handoff ticket',
    });
  }
}

/**
 * Initiates Google OAuth 2.0 flow for Gmail API sending.
 * Supports active admin session or single-use handoff ticket. Never accepts JWT in URL.
 * GET /api/email/oauth/start
 */
export async function startOAuth(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let userId = req.user?.userId;
    let agencyId = req.user?.agencyId;

    // Check if handoff ticket is provided for cross-origin browser redirects
    const ticket = req.query.ticket as string | undefined;
    if (ticket) {
      const handoff = await GmailService.validateAndConsumeHandoffTicket(ticket);
      if (!handoff) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired OAuth handoff ticket. Please initiate connection again from the dashboard.',
        });
        return;
      }
      userId = handoff.userId || undefined;
      agencyId = handoff.agencyId || undefined;
    } else if (!userId) {
      // Neither active session nor handoff ticket provided
      res.status(401).json({
        success: false,
        message: 'Authentication required. Provide an active session or a valid single-use handoff ticket.',
      });
      return;
    }

    const { url, state } = await GmailService.generateAuthUrl(userId, agencyId);

    // Set secure HTTP-only state cookie for extra defense-in-depth
    res.cookie('gb_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/api/email',
    });

    // If client requested JSON (API client), return JSON with auth URL
    if (req.headers.accept?.includes('application/json')) {
      res.json({
        success: true,
        message: 'Google OAuth URL generated. Redirect to complete authentication.',
        data: {
          url,
          scope: GMAIL_SCOPE,
          state,
        },
      });
      return;
    }

    // Otherwise, redirect directly to Google's consent screen
    res.redirect(url);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to initialize Google OAuth flow',
    });
  }
}

/**
 * Handles OAuth 2.0 callback from Google.
 * Validates CSRF state, checks admin/agency active standing, and securely stores tokens.
 * GET /api/email/oauth2/callback
 */
export async function handleOAuth2Callback(req: Request, res: Response): Promise<void> {
  const { code, state, error } = req.query;

  // 1. Handle error response from Google (e.g., access_denied)
  if (error) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Grand Bandhan — Gmail Connection Cancelled</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0B1B3D; color: #FFF; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #081226; border: 1px solid #D4AF37; border-radius: 16px; padding: 40px; max-width: 520px; text-align: center; }
          h2 { color: #F87171; font-family: Georgia, serif; margin-top: 0; }
          p { color: #E2E8F0; font-size: 14px; line-height: 1.6; }
          .btn { display: inline-block; background: #D4AF37; color: #0B1B3D; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Google Authorization Cancelled</h2>
          <p>The authorization request was cancelled or declined by Google: <strong>${escapeHtml(String(error))}</strong></p>
          <a href="/dashboard" class="btn">Return to Operations Dashboard</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // 2. Validate Authorization Code presence
  if (!code || typeof code !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Missing authorization code in Google callback.',
    });
    return;
  }

  // 3. Validate CSRF State parameter against Neon PostgreSQL
  if (!state || typeof state !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Missing OAuth state parameter. Request rejected to prevent CSRF attacks.',
    });
    return;
  }

  const oauthState = await GmailService.validateAndConsumeState(state);
  if (!oauthState) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Grand Bandhan — CSRF Validation Failed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0B1B3D; color: #FFF; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #081226; border: 1px solid #EF4444; border-radius: 16px; padding: 40px; max-width: 520px; text-align: center; }
          h2 { color: #EF4444; font-family: Georgia, serif; margin-top: 0; }
          p { color: #E2E8F0; font-size: 14px; line-height: 1.6; }
          .btn { display: inline-block; background: #D4AF37; color: #0B1B3D; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Security Alert: Invalid OAuth State</h2>
          <p>The state parameter is invalid, expired, or was already consumed. This check prevents Cross-Site Request Forgery (CSRF). Please restart the connection flow from your Grand Bandhan command portal.</p>
          <a href="/dashboard" class="btn">Return to Portal</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // 4. Verify callback state binding: check initiating admin standing & agency isolation
  if (oauthState.userId) {
    const adminUser = await prisma.user.findUnique({
      where: { id: oauthState.userId },
      include: { agency: true },
    }).catch(() => null);

    if (!adminUser || !adminUser.isActive || adminUser.accountStatus !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        message: 'Security validation failed: Initiating administrator account is deactivated or invalid.',
      });
      return;
    }

    if (oauthState.agencyId && adminUser.agencyId !== oauthState.agencyId && adminUser.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({
        success: false,
        message: 'Security validation failed: Initiating administrator does not belong to the bound agency.',
      });
      return;
    }

    if (adminUser.agency && adminUser.agency.status === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        message: 'Security validation failed: Bound agency account is suspended.',
      });
      return;
    }
  }

  if (oauthState.agencyId) {
    const agency = await prisma.agency.findUnique({
      where: { id: oauthState.agencyId },
    }).catch(() => null);

    if (!agency || agency.status === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        message: 'Security validation failed: Target agency is suspended or does not exist.',
      });
      return;
    }
  }

  // 5. Exchange code for tokens and store encrypted tokens in Neon PostgreSQL
  try {
    const tokens = await GmailService.exchangeCodeForTokens(code, {
      agencyId: oauthState.agencyId,
      userId: oauthState.userId,
    });

    res.clearCookie('gb_oauth_state', { path: '/api/email' });

    // If client requested JSON, return JSON confirmation
    if (req.headers.accept?.includes('application/json')) {
      res.json({
        success: true,
        message: 'Gmail API OAuth 2.0 authorization successful.',
        data: {
          agencyId: oauthState.agencyId || null,
          senderEmail: env.GMAIL_SENDER_EMAIL,
          scope: tokens.scope || GMAIL_SCOPE,
          hasRefreshToken: Boolean(tokens.refresh_token || env.GMAIL_REFRESH_TOKEN),
          tokenEncrypted: true,
        },
      });
      return;
    }

    // Otherwise render branded Imperial Navy/Gold HTML confirmation screen
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Grand Bandhan — Gmail Connected</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0B1B3D; color: #FFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #081226; border: 2px solid #D4AF37; border-radius: 20px; padding: 48px; max-width: 560px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .crown { font-size: 48px; line-height: 1; margin-bottom: 12px; }
          h1 { color: #D4AF37; font-family: Georgia, serif; font-size: 26px; margin: 0 0 8px 0; }
          .subtitle { color: #94A3B8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; }
          .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 9999px; padding: 6px 16px; font-size: 12px; font-weight: bold; margin-bottom: 24px; }
          .info-box { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 18px; text-align: left; margin-bottom: 28px; font-size: 13px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .info-row:last-child { margin-bottom: 0; }
          .info-label { color: #94A3B8; }
          .info-value { color: #F1F5F9; font-weight: 600; font-family: monospace; }
          .btn-group { display: flex; gap: 12px; justify-content: center; }
          .btn-primary { background: linear-gradient(135deg, #D4AF37 0%, #AA8010 100%); color: #081226; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; }
          .btn-secondary { background: rgba(255,255,255,0.08); color: #F1F5F9; border: 1px solid rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="crown">👑</div>
          <h1>Gmail API Connected Successfully</h1>
          <div class="subtitle">Grand Bandhan Imperial Email Engine</div>
          <div class="badge">● Live & Ready for Automated Outbox Sending</div>

          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Connected Sender:</span>
              <span class="info-value">${escapeHtml(env.GMAIL_SENDER_EMAIL)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Granted Scope:</span>
              <span class="info-value">https://www.googleapis.com/auth/gmail.send</span>
            </div>
            <div class="info-row">
              <span class="info-label">Token Storage:</span>
              <span class="info-value">Neon PostgreSQL (AES-256-GCM Encrypted)</span>
            </div>
            <div class="info-row">
              <span class="info-label">Access Mode:</span>
              <span class="info-value">Offline (Auto-Refresh Enabled)</span>
            </div>
            ${oauthState.agencyId ? `
            <div class="info-row">
              <span class="info-label">Bound Agency:</span>
              <span class="info-value">${escapeHtml(oauthState.agencyId)}</span>
            </div>` : ''}
          </div>

          <div class="btn-group">
            <a href="/dashboard" class="btn-primary">Return to Dashboard</a>
            <a href="/api/email/status" class="btn-secondary">Check Status API</a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: `Failed to exchange authorization code for Gmail tokens: ${err.message}`,
    });
  }
}

/**
 * Returns current Gmail connection status without exposing sensitive credentials or tokens.
 * Enforces agency isolation: Agency Admins only view their agency status; Super Admins can query any agency.
 * GET /api/email/status
 */
export async function getEmailStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    // Agency isolation: Agency Admins are restricted to their own agency context
    const targetAgencyId = isSuperAdmin
      ? (req.query.agencyId as string | undefined)
      : req.user?.agencyId;

    const statusData = await GmailService.getStatus(targetAgencyId);
    res.json({
      success: true,
      data: statusData,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to inspect email status',
    });
  }
}

/**
 * Sends a test email via Gmail API and logs to Neon EmailLog.
 * Enforces agency isolation: Agency Admins cannot dispatch test emails for another agency.
 * POST /api/email/test
 */
export async function sendTestEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
    // Agency isolation: Agency Admins are strictly bound to their agency
    const agencyId = isSuperAdmin
      ? (req.body?.agencyId || req.user?.agencyId)
      : req.user?.agencyId;

    const targetEmail = req.body?.to || env.GMAIL_SENDER_EMAIL || req.user?.email;
    const customSubject = req.body?.subject || '👑 Grand Bandhan — Gmail API Integration Test';
    const customMessage =
      req.body?.message ||
      'This is an automated operational test email sent via Google OAuth 2.0 and the Gmail API from Grand Bandhan.';

    if (!targetEmail) {
      res.status(400).json({
        success: false,
        message: 'Recipient email address is required (pass { "to": "email@domain.com" }).',
      });
      return;
    }

    // HTML Email Template
    const html = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0B1B3D; color: #FFFFFF; border: 2px solid #D4AF37; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0B1B3D 0%, #081226 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.4);">
          <div style="font-size: 36px; margin-bottom: 8px;">👑</div>
          <h1 style="color: #D4AF37; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Grand Bandhan</h1>
          <p style="color: #E2E8F0; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 6px 0 0 0;">Gmail API Integration Verification</p>
        </div>

        <div style="padding: 30px; background: #FFFFFF; color: #1E293B;">
          <h2 style="color: #0B1B3D; font-size: 18px; margin-top: 0;">Verification Message Dispatched Successfully</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            ${escapeHtml(customMessage)}
          </p>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 12px;">
            <p style="margin: 0 0 6px 0;"><strong>Sender Account:</strong> ${escapeHtml(env.GMAIL_SENDER_EMAIL)}</p>
            <p style="margin: 0 0 6px 0;"><strong>Recipient:</strong> ${escapeHtml(targetEmail)}</p>
            <p style="margin: 0 0 6px 0;"><strong>OAuth Scope:</strong> ${GMAIL_SCOPE}</p>
            <p style="margin: 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>

          <p style="font-size: 12px; color: #64748B;">
            This email confirms that Grand Bandhan is authorized to send real luxury wedding operational communications, client quotations, and verification updates directly through Gmail API.
          </p>
        </div>

        <div style="background: #081226; padding: 20px; text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid rgba(212, 175, 55, 0.2);">
          Grand Bandhan Luxury Weddings & Operations • Lake Palace Road, Udaipur, Rajasthan
        </div>
      </div>
    `;

    const result = await GmailService.sendEmail({
      to: targetEmail,
      subject: customSubject,
      html,
      text: customMessage,
      agencyId,
      relatedEntityType: 'TEST_EMAIL',
    });

    res.json({
      success: true,
      message: `Test email successfully sent via Gmail API to ${targetEmail}.`,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: `Gmail test email delivery failed: ${err.message}`,
    });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
