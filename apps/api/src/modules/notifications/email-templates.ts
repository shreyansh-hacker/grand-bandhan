import { NotificationEvent } from './notification.types';

/**
 * Escapes user-generated input to prevent HTML injection in emails.
 */
export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Luxury Grand Bandhan Email Brand Palette:
 * Primary Navy: #0A2540
 * Secondary Blue: #1E3A8A
 * Royal Gold: #C9A96A
 * Light Gold: #E6D6B8
 * Cream Background: #F7F4ED
 */
function baseTemplate(
  title: string,
  bodyContent: string,
  actionButton?: { label: string; url: string }
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F7F4ED; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0A2540; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #F7F4ED; padding: 30px 12px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E6D6B8; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(10, 37, 64, 0.08); }
    .header { background: linear-gradient(135deg, #0A2540 0%, #1E3A8A 100%); padding: 36px 24px; text-align: center; border-bottom: 3px solid #C9A96A; }
    .logo-badge { display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #C9A96A 0%, #F7F4ED 50%, #C9A96A 100%); padding: 2px; margin-bottom: 12px; }
    .logo-inner { background-color: #0A2540; width: 100%; height: 100%; border-radius: 50%; line-height: 48px; font-size: 22px; color: #C9A96A; }
    .brand-title { color: #FFFFFF; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: bold; letter-spacing: 1.5px; margin: 0; text-transform: uppercase; }
    .brand-subtitle { color: #C9A96A; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; font-weight: 500; }
    .content { padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #2D3748; }
    .heading { font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #0A2540; margin-top: 0; margin-bottom: 18px; font-weight: 600; line-height: 1.3; }
    .badge { display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px; background-color: #F7F4ED; color: #8C6D23; border: 1px solid #C9A96A; margin-bottom: 18px; }
    .badge.alert { background-color: #FFF5F5; color: #C53030; border-color: #FEB2B2; }
    .badge.success { background-color: #F0FFF4; color: #276749; border-color: #9AE6B4; }
    .card { background-color: #F7F4ED; border: 1px solid #E6D6B8; border-radius: 8px; padding: 18px 20px; margin: 22px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #E6D6B8; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #4A5568; font-weight: 500; }
    .detail-value { color: #0A2540; font-weight: 600; text-align: right; }
    .btn-container { text-align: center; margin: 32px 0 16px; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #C9A96A 0%, #A8863D 100%); color: #0A2540 !important; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 8px; box-shadow: 0 4px 14px rgba(201, 169, 106, 0.4); text-transform: uppercase; letter-spacing: 0.8px; }
    .footer { background-color: #0A2540; padding: 26px 20px; text-align: center; font-size: 12px; color: #A0AEC0; border-top: 1px solid rgba(201, 169, 106, 0.3); }
    .footer a { color: #C9A96A; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">
          <div class="logo-inner">👑</div>
        </div>
        <div class="brand-title">GRAND BANDHAN</div>
        <div class="brand-subtitle">Imperial Wedding Operations Platform</div>
      </div>
      <div class="content">
        ${bodyContent}
        ${actionButton ? `
        <div class="btn-container">
          <a href="${actionButton.url}" class="btn" target="_blank">${escapeHtml(actionButton.label)}</a>
        </div>` : ''}
      </div>
      <div class="footer">
        <p style="margin: 0 0 6px;">&copy; ${new Date().getFullYear()} Grand Bandhan. Confidential &amp; Proprietary.</p>
        <p style="margin: 0;">Preserving Royal Indian Traditions with Modern Precision.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export interface RenderedTemplate {
  subject: string;
  html: string;
  text: string;
}

export function renderEmailTemplate(event: NotificationEvent, data: Record<string, any>): RenderedTemplate {
  const appUrl = data.appUrl || process.env.FRONTEND_URL || 'https://grand-bandhan-theta.vercel.app';

  switch (event) {
    case NotificationEvent.PASSWORD_RESET: {
      const resetUrl = data.resetUrl || `${appUrl}/reset-password?token=${data.token || ''}`;
      return {
        subject: '🔒 Imperial Security: Password Reset Request',
        html: baseTemplate(
          'Password Reset Request',
          `
          <div class="badge">SECURITY VERIFICATION</div>
          <h2 class="heading">Reset Your Imperial Credentials</h2>
          <p>Dear <strong>${escapeHtml(data.name || 'Imperial Member')}</strong>,</p>
          <p>We received an authorized request to reset the password associated with your Grand Bandhan account.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Account Email:</span><span class="detail-value">${escapeHtml(data.email)}</span></div>
            <div class="detail-row"><span class="detail-label">Request Time:</span><span class="detail-value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span></div>
            <div class="detail-row"><span class="detail-label">Valid For:</span><span class="detail-value">60 Minutes</span></div>
          </div>
          <p>Click the secure button below to choose a new password. If you did not initiate this request, no action is required; your account remains secure.</p>
          `,
          { label: 'Reset My Password', url: resetUrl }
        ),
        text: `Reset Your Grand Bandhan Password\n\nDear ${data.name || 'Imperial Member'},\n\nWe received a request to reset your password. Use the following secure link (valid for 60 minutes):\n${resetUrl}\n\nIf you did not request this, please disregard this email.`,
      };
    }

    case NotificationEvent.AGENCY_REGISTERED:
      return {
        subject: `Imperial Agency Application Received — ${data.agencyName}`,
        html: baseTemplate(
          'Agency Registration Received',
          `
          <h2 class="heading">Welcome to the Imperial Network</h2>
          <p>Dear <strong>${escapeHtml(data.ownerName || 'Agency Leader')}</strong>,</p>
          <p>We have successfully received the onboarding application for <strong>${escapeHtml(data.agencyName)}</strong> on the Grand Bandhan Platform.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Agency:</span><span class="detail-value">${escapeHtml(data.agencyName)}</span></div>
            <div class="detail-row"><span class="detail-label">City/State:</span><span class="detail-value">${escapeHtml(data.city || 'India')}, ${escapeHtml(data.state || '')}</span></div>
            <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value">Pending Super Admin Review</span></div>
            <div class="detail-row"><span class="detail-label">Submission Date:</span><span class="detail-value">${new Date().toLocaleDateString('en-IN')}</span></div>
          </div>
          <p>Our verification team reviews all wedding agency credentials within 24 business hours. You will receive an immediate notification once your agency operations workspace is activated.</p>
          `,
          { label: 'View Application Status', url: `${appUrl}/login` }
        ),
        text: `Grand Bandhan: Agency Registration Received for ${data.agencyName}.\nStatus: Pending Super Admin Review.\nLogin to track: ${appUrl}/login`,
      };

    case NotificationEvent.AGENCY_SUBMITTED_FOR_APPROVAL:
      return {
        subject: `👑 New Agency Onboarding Submission: ${data.agencyName}`,
        html: baseTemplate(
          'New Agency Pending Review',
          `
          <div class="badge">SUPER ADMIN ACTION REQUIRED</div>
          <h2 class="heading">New Agency Registration Submitted</h2>
          <p>Dear <strong>Imperial Super Admin</strong>,</p>
          <p>A new wedding agency has submitted their registration application and is awaiting credential verification.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Agency Name:</span><span class="detail-value">${escapeHtml(data.agencyName)}</span></div>
            <div class="detail-row"><span class="detail-label">Owner Name:</span><span class="detail-value">${escapeHtml(data.ownerName)}</span></div>
            <div class="detail-row"><span class="detail-label">Contact Email:</span><span class="detail-value">${escapeHtml(data.email)}</span></div>
            <div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-value">${escapeHtml(data.phone || 'N/A')}</span></div>
            <div class="detail-row"><span class="detail-label">Location:</span><span class="detail-value">${escapeHtml(data.city || '')}, ${escapeHtml(data.state || '')}</span></div>
          </div>
          <p>Please review the submitted credentials in the Super Admin governance portal to approve or decline the workspace provision.</p>
          `,
          { label: 'Review Agency in Portal', url: `${appUrl}/super-admin/agencies` }
        ),
        text: `New Agency Submitted: ${data.agencyName} (${data.ownerName}, ${data.email}). Review in Super Admin Portal: ${appUrl}/super-admin/agencies`,
      };

    case NotificationEvent.AGENCY_APPROVED:
      return {
        subject: `👑 Congratulations! Your Agency Workspace is Approved — ${data.agencyName}`,
        html: baseTemplate(
          'Agency Workspace Activated',
          `
          <div class="badge success">APPLICATION APPROVED</div>
          <h2 class="heading">Your Imperial Operations Workspace is Live</h2>
          <p>Dear <strong>${escapeHtml(data.ownerName || 'Agency Administrator')}</strong>,</p>
          <p>We are delighted to confirm that <strong>${escapeHtml(data.agencyName)}</strong> has been officially approved on Grand Bandhan. Your dedicated multi-tenant workspace is fully provisioned and ready for your team.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Agency:</span><span class="detail-value">${escapeHtml(data.agencyName)}</span></div>
            <div class="detail-row"><span class="detail-label">Admin Email:</span><span class="detail-value">${escapeHtml(data.email)}</span></div>
            <div class="detail-row"><span class="detail-label">Workspace Status:</span><span class="detail-value" style="color: #276749;">Active</span></div>
          </div>
          <p>You can now invite wedding planners, empanel luxury vendors, and start managing royal celebrations.</p>
          `,
          { label: 'Enter Agency Dashboard', url: `${appUrl}/login` }
        ),
        text: `Congratulations! Your Agency Workspace for ${data.agencyName} is Approved.\nAccess dashboard: ${appUrl}/login`,
      };

    case NotificationEvent.AGENCY_REJECTED:
      return {
        subject: `Update Regarding Your Agency Application — ${data.agencyName}`,
        html: baseTemplate(
          'Agency Application Update',
          `
          <div class="badge alert">APPLICATION UPDATE</div>
          <h2 class="heading">Grand Bandhan Onboarding Review</h2>
          <p>Dear <strong>${escapeHtml(data.ownerName || 'Applicant')}</strong>,</p>
          <p>Thank you for your interest in joining Grand Bandhan. After reviewing the credentials submitted for <strong>${escapeHtml(data.agencyName)}</strong>, our compliance team requires additional information before we can proceed.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Review Status:</span><span class="detail-value" style="color: #C53030;">Additional Information Needed</span></div>
            <div class="detail-row"><span class="detail-label">Reason:</span><span class="detail-value">${escapeHtml(data.rejectionReason || 'Business verification details incomplete')}</span></div>
          </div>
          <p>Please contact our onboarding concierge at <a href="mailto:shreyanshsharma049@gmail.com">shreyanshsharma049@gmail.com</a> with the requested documentation.</p>
          `
        ),
        text: `Grand Bandhan Onboarding Update for ${data.agencyName}: Additional Information Needed. Reason: ${data.rejectionReason || 'Verification incomplete'}. Contact shreyanshsharma049@gmail.com`,
      };

    case NotificationEvent.AGENCY_SUSPENDED:
      return {
        subject: `⚠️ Important Notice: Agency Workspace Suspended — ${data.agencyName}`,
        html: baseTemplate(
          'Agency Workspace Suspended',
          `
          <div class="badge alert">WORKSPACE SUSPENDED</div>
          <h2 class="heading">Imperial Workspace Access Suspended</h2>
          <p>Dear <strong>${escapeHtml(data.ownerName || 'Agency Administrator')}</strong>,</p>
          <p>Access to your Grand Bandhan agency workspace for <strong>${escapeHtml(data.agencyName)}</strong> has been temporarily suspended by system governance.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Agency:</span><span class="detail-value">${escapeHtml(data.agencyName)}</span></div>
            <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value" style="color: #C53030;">Suspended</span></div>
            <div class="detail-row"><span class="detail-label">Reason:</span><span class="detail-value">${escapeHtml(data.reason || 'Administrative or policy review')}</span></div>
          </div>
          <p>Active planning workspaces and staff logins are on hold. Please contact platform compliance at <a href="mailto:support@grandbandhan.com">support@grandbandhan.com</a> immediately to resolve this matter.</p>
          `
        ),
        text: `Notice: Grand Bandhan workspace for ${data.agencyName} has been suspended. Reason: ${data.reason || 'Administrative review'}. Contact support@grandbandhan.com.`,
      };

    case NotificationEvent.NEW_ENQUIRY_RECEIVED:
      return {
        subject: data.subject || `👑 Royal Wedding Enquiry Received: ${data.referenceNumber || 'New Enquiry'}`,
        html: baseTemplate(
          'Enquiry Confirmation',
          `
          <div class="badge">ENQUIRY REFERENCE: ${escapeHtml(data.referenceNumber || 'GB-ENQ-2026')}</div>
          <h2 class="heading">Thank You for Inquiring with Grand Bandhan</h2>
          <p>Dear <strong>${escapeHtml(data.customerName)}</strong>,</p>
          <p>It is our pleasure to receive your imperial celebration enquiry. Our senior wedding planners and concierge desk have been notified and are reviewing your request.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Reference No:</span><span class="detail-value">${escapeHtml(data.referenceNumber || 'GB-ENQ-2026')}</span></div>
            <div class="detail-row"><span class="detail-label">Client Name:</span><span class="detail-value">${escapeHtml(data.customerName)}</span></div>
            ${data.phone ? `<div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-value">${escapeHtml(data.phone)}</span></div>` : ''}
            <div class="detail-row"><span class="detail-label">Wedding Date:</span><span class="detail-value">${data.weddingDate ? new Date(data.weddingDate).toLocaleDateString('en-IN') : 'Flexible'}</span></div>
            <div class="detail-row"><span class="detail-label">Destination / City:</span><span class="detail-value">${escapeHtml(data.location || 'India')}</span></div>
            <div class="detail-row"><span class="detail-label">Expected Guests:</span><span class="detail-value">${escapeHtml(data.guestCount || '250')} Guests</span></div>
            <div class="detail-row"><span class="detail-label">Planning Side:</span><span class="detail-value">${escapeHtml(data.planningFor || 'Joint')}</span></div>
            ${data.notes ? `<div class="detail-row"><span class="detail-label">Message / Dispatch:</span><span class="detail-value" style="color:#C9A96A;font-weight:bold;">${escapeHtml(data.notes)}</span></div>` : ''}
          </div>
          <p>Your dedicated planner / concierge officer will reach out promptly.</p>
          `,
          { label: 'Track Enquiry Status', url: `${appUrl}/enquiry/${data.referenceNumber || ''}` }
        ),
        text: `Thank you for your enquiry with Grand Bandhan! Ref: ${data.referenceNumber}. Phone: ${data.phone || ''}. Notes: ${data.notes || ''}. Track status: ${appUrl}/enquiry/${data.referenceNumber}`,
      };

    case NotificationEvent.ENQUIRY_ASSIGNED:
      return {
        subject: `New Wedding Lead Assigned: ${data.referenceNumber} (${data.customerName})`,
        html: baseTemplate(
          'Wedding Lead Assigned',
          `
          <h2 class="heading">New Client Assigned to Your Portfolio</h2>
          <p>Dear <strong>${escapeHtml(data.plannerName || 'Wedding Planner')}</strong>,</p>
          <p>You have been assigned as the lead wedding planner for client <strong>${escapeHtml(data.customerName)}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Enquiry Ref:</span><span class="detail-value">${escapeHtml(data.referenceNumber)}</span></div>
            <div class="detail-row"><span class="detail-label">Client Name:</span><span class="detail-value">${escapeHtml(data.customerName)}</span></div>
            <div class="detail-row"><span class="detail-label">Contact:</span><span class="detail-value">${escapeHtml(data.customerPhone)} | ${escapeHtml(data.customerEmail)}</span></div>
            <div class="detail-row"><span class="detail-label">Target Location:</span><span class="detail-value">${escapeHtml(data.location)}</span></div>
            <div class="detail-row"><span class="detail-label">Budget Range:</span><span class="detail-value">₹${((data.minBudget || 0)/100000).toFixed(1)}L - ₹${((data.maxBudget || 0)/100000).toFixed(1)}L</span></div>
          </div>
          <p>Please initiate initial client contact and update consultation notes in your planner dashboard.</p>
          `,
          { label: 'Open Enquiry Details', url: `${appUrl}/dashboard/enquiries` }
        ),
        text: `New Lead Assigned: ${data.customerName} (${data.referenceNumber}). Contact: ${data.customerPhone} / ${data.customerEmail}. View in dashboard: ${appUrl}/dashboard/enquiries`,
      };

    case NotificationEvent.ENQUIRY_STATUS_CHANGED:
      return {
        subject: `Update on Wedding Enquiry: ${data.referenceNumber} (${data.newStatus})`,
        html: baseTemplate(
          'Enquiry Status Update',
          `
          <div class="badge">ENQUIRY STATUS UPDATE</div>
          <h2 class="heading">Enquiry Progress Update</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || 'Valued Member')}</strong>,</p>
          <p>The status of wedding enquiry <strong>${escapeHtml(data.referenceNumber)}</strong> has progressed to <strong>${escapeHtml(data.newStatus)}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Reference No:</span><span class="detail-value">${escapeHtml(data.referenceNumber)}</span></div>
            <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${escapeHtml(data.customerName)}</span></div>
            <div class="detail-row"><span class="detail-label">New Status:</span><span class="detail-value">${escapeHtml(data.newStatus)}</span></div>
            ${data.notes ? `<div class="detail-row"><span class="detail-label">Notes:</span><span class="detail-value">${escapeHtml(data.notes)}</span></div>` : ''}
          </div>
          ${data.temporaryPassword ? `
          <div class="card" style="border: 2px solid #D4AF37; background: #fffcf0; padding: 18px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top:0; color: #0A2540; font-size: 16px;">👑 Your Royal Client Portal Access Credentials</h3>
            <div class="detail-row"><span class="detail-label">Login Email:</span><span class="detail-value"><strong>${escapeHtml(data.loginEmail || data.email)}</strong></span></div>
            <div class="detail-row"><span class="detail-label">Temporary Password:</span><span class="detail-value" style="font-family: monospace; font-size: 15px; color: #8C1D40; font-weight: bold; background: #f3f3f3; padding: 2px 8px; border-radius: 4px;">${escapeHtml(data.temporaryPassword)}</span></div>
            <div class="detail-row"><span class="detail-label">Standard Login URL:</span><span class="detail-value"><a href="${escapeHtml(data.loginUrl || `${appUrl}/login`)}" style="color: #D4AF37; font-weight: bold;">${appUrl}/login</a></span></div>
            <div class="detail-row"><span class="detail-label">Security Advisory:</span><span class="detail-value" style="color: #718096; font-size: 12px;">Sign in at /login to review your tailored proposals and customize your credentials.</span></div>
          </div>
          ` : ''}
          `,
          { label: 'Track Enquiry Status', url: data.referenceNumber ? `${appUrl}/enquiry/${data.referenceNumber}` : `${appUrl}/dashboard/enquiries` }
        ),
        text: `Enquiry ${data.referenceNumber} status updated to ${data.newStatus}. Notes: ${data.notes || 'None'}. View: ${appUrl}/dashboard/enquiries`,
      };


    case NotificationEvent.CONSULTATION_RESCHEDULED:
      return {
        subject: `🔄 Wedding Consultation Rescheduled: ${data.customerName} (${new Date(data.consultationDate).toLocaleDateString('en-IN')})`,
        html: baseTemplate(
          'Consultation Rescheduled',
          `
          <div class="badge">CONSULTATION RESCHEDULED</div>
          <h2 class="heading">Updated Consultation Details</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || data.customerName)}</strong>,</p>
          <p>Your wedding design consultation with Grand Bandhan has been rescheduled to the updated date and time below.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${escapeHtml(data.customerName)}</span></div>
            <div class="detail-row"><span class="detail-label">New Date &amp; Time:</span><span class="detail-value">${new Date(data.consultationDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span></div>
            <div class="detail-row"><span class="detail-label">Meeting Format:</span><span class="detail-value">${escapeHtml(data.consultationType || 'Virtual Video Consultation')}</span></div>
            ${data.meetingLink ? `<div class="detail-row"><span class="detail-label">Meeting Link:</span><span class="detail-value"><a href="${escapeHtml(data.meetingLink)}" style="color: #D4AF37; font-weight: bold;">Join Video Meeting</a></span></div>` : ''}
            ${data.meetingLocation ? `<div class="detail-row"><span class="detail-label">Meeting Location:</span><span class="detail-value">${escapeHtml(data.meetingLocation)}</span></div>` : ''}
            <div class="detail-row"><span class="detail-label">Assigned Planner:</span><span class="detail-value">${escapeHtml(data.plannerName || 'Lead Wedding Specialist')}</span></div>
            ${data.rescheduleReason ? `<div class="detail-row"><span class="detail-label">Reschedule Note:</span><span class="detail-value">${escapeHtml(data.rescheduleReason)}</span></div>` : ''}
          </div>
          <p>If you need to make further adjustments, please contact your wedding concierge desk.</p>
          `,
          { label: 'View Consultation Status', url: data.referenceNumber ? `${appUrl}/enquiry/${data.referenceNumber}` : `${appUrl}/dashboard/enquiries` }
        ),
        text: `Wedding Consultation Rescheduled to ${new Date(data.consultationDate).toLocaleString('en-IN')}. Planner: ${data.plannerName || 'Lead Planner'}. Note: ${data.rescheduleReason || 'None'}.`,
      };

    case NotificationEvent.CONSULTATION_CANCELLED:
      return {
        subject: `Wedding Consultation Cancelled: ${data.customerName} (${data.referenceNumber || 'Notice'})`,
        html: baseTemplate(
          'Consultation Cancelled',
          `
          <div class="badge alert">CONSULTATION CANCELLED</div>
          <h2 class="heading">Consultation Notice</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || data.customerName)}</strong>,</p>
          <p>Your scheduled wedding consultation for enquiry <strong>${escapeHtml(data.referenceNumber || '')}</strong> has been cancelled.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${escapeHtml(data.customerName)}</span></div>
            <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value" style="color: #C53030; font-weight: bold;">Cancelled</span></div>
            ${data.notes ? `<div class="detail-row"><span class="detail-label">Reason:</span><span class="detail-value">${escapeHtml(data.notes)}</span></div>` : ''}
          </div>
          <p>You may request a new meeting slot at your convenience through your tracker or contact your assigned planner.</p>
          `,
          { label: 'Reschedule Consultation', url: data.referenceNumber ? `${appUrl}/enquiry/${data.referenceNumber}` : `${appUrl}/dashboard/enquiries` }
        ),
        text: `Wedding consultation for ${data.customerName} has been cancelled. Contact concierge to reschedule.`,
      };

    case NotificationEvent.CONSULTATION_SCHEDULED:
      return {
        subject: `📅 Wedding Consultation Scheduled: ${data.customerName} (${new Date(data.consultationDate).toLocaleDateString('en-IN')})`,
        html: baseTemplate(
          'Consultation Scheduled',
          `
          <div class="badge">CONSULTATION CONFIRMED</div>
          <h2 class="heading">Imperial Wedding Design Consultation</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || data.customerName)}</strong>,</p>
          <p>Your wedding design consultation has been successfully scheduled. Our team looks forward to discussing your royal vision.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${escapeHtml(data.customerName)}</span></div>
            <div class="detail-row"><span class="detail-label">Date &amp; Time:</span><span class="detail-value">${new Date(data.consultationDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span></div>
            <div class="detail-row"><span class="detail-label">Mode / Type:</span><span class="detail-value">${escapeHtml(data.consultationType || 'Virtual Video Consultation')}</span></div>
            <div class="detail-row"><span class="detail-label">Planner:</span><span class="detail-value">${escapeHtml(data.plannerName || 'Lead Planner')}</span></div>
            ${data.notes ? `<div class="detail-row"><span class="detail-label">Preparation Notes:</span><span class="detail-value">${escapeHtml(data.notes)}</span></div>` : ''}
          </div>
          `,
          { label: 'View Consultation in Portal', url: `${appUrl}/dashboard/enquiries` }
        ),
        text: `Wedding Consultation Confirmed on ${new Date(data.consultationDate).toLocaleString('en-IN')}. Type: ${data.consultationType || 'Video'}. Planner: ${data.plannerName || 'Lead Planner'}.`,
      };

    case NotificationEvent.PROPOSAL_SENT:
      return {
        subject: `👑 Your Bespoke Wedding Proposal is Ready — Grand Bandhan (${data.proposalNumber})`,
        html: baseTemplate(
          'Wedding Proposal Ready',
          `
          <div class="badge">PROPOSAL: ${escapeHtml(data.proposalNumber)}</div>
          <h2 class="heading">Your Imperial Celebration Proposal</h2>
          <p>Dear <strong>${escapeHtml(data.customerName)}</strong>,</p>
          <p>We are delighted to present your tailored wedding proposal for your upcoming wedding in <strong>${escapeHtml(data.location)}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Proposal No:</span><span class="detail-value">${escapeHtml(data.proposalNumber)}</span></div>
            <div class="detail-row"><span class="detail-label">Package:</span><span class="detail-value">${escapeHtml(data.packageType || 'Full-Service')}</span></div>
            <div class="detail-row"><span class="detail-label">Estimated Budget:</span><span class="detail-value">₹${(data.estimatedBudget || 0).toLocaleString('en-IN')}</span></div>
            <div class="detail-row"><span class="detail-label">Valid Until:</span><span class="detail-value">${data.validUntil ? new Date(data.validUntil).toLocaleDateString('en-IN') : '30 Days'}</span></div>
          </div>
          <p>Review the comprehensive scope of work, milestone schedule, and vendor recommendations in your secure client portal.</p>
          `,
          { label: 'Review & Respond to Proposal', url: `${appUrl}/proposal/${data.proposalId || ''}` }
        ),
        text: `Your Bespoke Proposal (${data.proposalNumber}) is ready. Estimated Budget: ₹${(data.estimatedBudget || 0).toLocaleString('en-IN')}. Review and respond: ${appUrl}/proposal/${data.proposalId || ''}`,
      };

    case NotificationEvent.PROPOSAL_ACCEPTED:
      return {
        subject: `🎉 Proposal Accepted: ${data.proposalNumber} (${data.customerName})`,
        html: baseTemplate(
          'Proposal Accepted',
          `
          <div class="badge success">PROPOSAL ACCEPTED</div>
          <h2 class="heading">Client Has Accepted the Proposal!</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || 'Agency Leader')}</strong>,</p>
          <p>Congratulations! Client <strong>${escapeHtml(data.customerName)}</strong> has formally accepted proposal <strong>${escapeHtml(data.proposalNumber)}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Proposal No:</span><span class="detail-value">${escapeHtml(data.proposalNumber)}</span></div>
            <div class="detail-row"><span class="detail-label">Client Name:</span><span class="detail-value">${escapeHtml(data.customerName)}</span></div>
            <div class="detail-row"><span class="detail-label">Accepted At:</span><span class="detail-value">${new Date().toLocaleDateString('en-IN')}</span></div>
            ${data.notes ? `<div class="detail-row"><span class="detail-label">Client Notes:</span><span class="detail-value">${escapeHtml(data.notes)}</span></div>` : ''}
          </div>
          <p>Next steps: Generate the digital service agreement and convert this enquiry into an active wedding project.</p>
          `,
          { label: 'Initialize Agreement & Project', url: `${appUrl}/dashboard/proposals` }
        ),
        text: `Proposal ${data.proposalNumber} accepted by ${data.customerName}! Access dashboard to prepare agreement: ${appUrl}/dashboard/proposals`,
      };

    case NotificationEvent.PROPOSAL_REJECTED:
      return {
        subject: `Proposal Declined: ${data.proposalNumber} (${data.customerName})`,
        html: baseTemplate(
          'Proposal Declined',
          `
          <div class="badge alert">PROPOSAL DECLINED</div>
          <h2 class="heading">Client Proposal Decision</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || 'Agency Leader')}</strong>,</p>
          <p>Client <strong>${escapeHtml(data.customerName)}</strong> has indicated they are unable to proceed with proposal <strong>${escapeHtml(data.proposalNumber)}</strong> at this time.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Proposal No:</span><span class="detail-value">${escapeHtml(data.proposalNumber)}</span></div>
            <div class="detail-row"><span class="detail-label">Client Name:</span><span class="detail-value">${escapeHtml(data.customerName)}</span></div>
            <div class="detail-row"><span class="detail-label">Decision Reason:</span><span class="detail-value">${escapeHtml(data.notes || 'No specific feedback provided')}</span></div>
          </div>
          <p>You may follow up with the client or offer an alternative package tailored to their preferences.</p>
          `,
          { label: 'View Proposal in Dashboard', url: `${appUrl}/dashboard/proposals` }
        ),
        text: `Proposal ${data.proposalNumber} declined by ${data.customerName}. Reason: ${data.notes || 'None'}. Dashboard: ${appUrl}/dashboard/proposals`,
      };

    case NotificationEvent.PROPOSAL_REVISION_REQUESTED:
      return {
        subject: `📝 Revision Requested on Proposal: ${data.proposalNumber} (${data.customerName})`,
        html: baseTemplate(
          'Proposal Revision Requested',
          `
          <div class="badge">REVISION REQUESTED</div>
          <h2 class="heading">Client Requested Adjustments</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || 'Wedding Planner')}</strong>,</p>
          <p>Client <strong>${escapeHtml(data.customerName)}</strong> has requested adjustments on proposal <strong>${escapeHtml(data.proposalNumber)}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Proposal No:</span><span class="detail-value">${escapeHtml(data.proposalNumber)}</span></div>
            <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${escapeHtml(data.customerName)}</span></div>
            <div class="detail-row"><span class="detail-label">Adjustment Notes:</span><span class="detail-value">${escapeHtml(data.notes || 'Adjustments requested in scope or budget')}</span></div>
          </div>
          <p>Please review the client feedback and publish an updated proposal revision.</p>
          `,
          { label: 'Open Proposal Editor', url: `${appUrl}/dashboard/proposals` }
        ),
        text: `Revision requested on proposal ${data.proposalNumber} by ${data.customerName}: ${data.notes || 'Scope adjustments'}. Open editor: ${appUrl}/dashboard/proposals`,
      };


    case NotificationEvent.AGREEMENT_VERIFIED:
      return {
        subject: `👑 Service Agreement Verified & Active Operations Unlocked: ${data.weddingCode || data.agreementNumber}`,
        html: baseTemplate(
          'Agreement Verified',
          `
          <div class="badge">AGREEMENT VERIFIED &amp; CONFIRMED</div>
          <h2 class="heading">Your Imperial Wedding Journey is Officially Live!</h2>
          <p>Dear <strong>${escapeHtml(data.couple || data.customerName || 'Valued Couple')}</strong>,</p>
          <p>We are delighted to confirm that your signed <strong>Wedding Planning &amp; Management Service Agreement</strong> (${escapeHtml(data.agreementNumber || 'GB-AGR')}) has been legally reviewed and officially <strong>VERIFIED</strong> by Grand Bandhan Senior Legal Operations.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Agreement Ref:</span><span class="detail-value">${escapeHtml(data.agreementNumber || 'GB-AGR-2026')}</span></div>
            <div class="detail-row"><span class="detail-label">Wedding Code:</span><span class="detail-value">${escapeHtml(data.weddingCode || 'GB-W-2026')}</span></div>
            <div class="detail-row"><span class="detail-label">Verification Status:</span><span class="detail-value" style="color: #2F855A; font-weight: bold;">VERIFIED &amp; EXECUTED ✓</span></div>
            <div class="detail-row"><span class="detail-label">Active Features:</span><span class="detail-value">26+ Auto Tasks, Vendor Bidding, Ceremony Timeline, Guest RSVPs</span></div>
          </div>
          <p>All active operations inside your royal Couple Portal have now been unlocked. Your lead wedding planner has commenced full-scale vendor sourcing and timeline synchronization.</p>
          `,
          { label: 'Enter Active Couple Portal', url: data.portalUrl || `${appUrl}/portal/client` }
        ),
        text: `Congratulations! Your Service Agreement (${data.agreementNumber}) is VERIFIED. Active operations are now live: ${data.portalUrl || appUrl + '/portal/client'}`,
      };

    case NotificationEvent.AGREEMENT_CORRECTION_REQUIRED:
      return {
        subject: `⚠️ Action Required: Agreement Document Correction Needed (${data.weddingCode || data.agreementNumber})`,
        html: baseTemplate(
          'Agreement Correction Required',
          `
          <div class="badge alert">ACTION REQUIRED</div>
          <h2 class="heading">Service Agreement Correction Notice</h2>
          <p>Dear <strong>${escapeHtml(data.couple || data.customerName || 'Valued Couple')}</strong>,</p>
          <p>During our administrative review of your submitted Service Agreement (<strong>${escapeHtml(data.agreementNumber || 'GB-AGR')}</strong>), our legal compliance desk identified that additional corrections or re-signing are required before operations can proceed.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Agreement Ref:</span><span class="detail-value">${escapeHtml(data.agreementNumber || 'GB-AGR')}</span></div>
            <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value" style="color: #C53030; font-weight: bold;">Correction Required</span></div>
            <div class="detail-row"><span class="detail-label">Reason / Correction Details:</span><span class="detail-value" style="color: #C53030;">${escapeHtml(data.rejectionReason || 'Document signature incomplete or illegible. Please re-sign.')}</span></div>
          </div>
          <p>Please visit your Couple Portal to review the notes, digitally re-sign, or upload a clear corrected document to resume verification.</p>
          `,
          { label: 'Review & Resubmit Agreement', url: data.portalUrl || `${appUrl}/portal/client` }
        ),
        text: `Notice: Corrections needed on agreement ${data.agreementNumber}. Reason: ${data.rejectionReason}. Resubmit at: ${data.portalUrl || appUrl + '/portal/client'}`,
      };

    case NotificationEvent.COUPLE_ACCOUNT_ACTIVATED:
      return {
        subject: `👑 Welcome to Your Grand Bandhan Royal Couple Portal (${data.coupleNames || 'Couple'})`,
        html: baseTemplate(
          'Account Activated',
          `
          <div class="badge">ROYAL PORTAL ACTIVATED</div>
          <h2 class="heading">Welcome to Grand Bandhan Imperial Portal</h2>
          <p>Dear <strong>${escapeHtml(data.coupleNames || 'Royal Couple')}</strong>,</p>
          <p>Your dedicated Couple Portal account has been officially activated. You now have full access to manage your ceremony schedules, review digital agreements, track guest RSVPs, and oversee milestone payments.</p>
          <div class="card" style="border: 2px solid #D4AF37; background: #fffcf0; padding: 18px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top:0; color: #0A2540; font-size: 16px;">👑 Your Royal Login Credentials</h3>
            <div class="detail-row"><span class="detail-label">Login Email:</span><span class="detail-value"><strong>${escapeHtml(data.loginEmail || data.email)}</strong></span></div>
            ${data.temporaryPassword ? `<div class="detail-row"><span class="detail-label">Temporary Password:</span><span class="detail-value" style="font-family: monospace; font-size: 15px; color: #8C1D40; font-weight: bold; background: #f3f3f3; padding: 2px 8px; border-radius: 4px;">${escapeHtml(data.temporaryPassword)}</span></div>` : ''}
            <div class="detail-row"><span class="detail-label">Direct Portal Link:</span><span class="detail-value"><a href="${escapeHtml(data.portalUrl || `${appUrl}/portal/client`)}" style="color: #D4AF37; font-weight: bold;">Access Couple Portal</a></span></div>
            <div class="detail-row"><span class="detail-label">Security Notice:</span><span class="detail-value" style="color: #718096; font-size: 12px;">For your privacy and data security, please change your password after logging in.</span></div>
          </div>
          `,
          { label: 'Log In to Couple Portal', url: data.portalUrl || `${appUrl}/login` }
        ),
        text: `Your Grand Bandhan Couple Portal is active! Login: ${data.loginEmail}, Password: ${data.temporaryPassword || 'Use existing'}. Portal: ${data.portalUrl || appUrl + '/portal/client'}`,
      };

    case NotificationEvent.AGREEMENT_SENT:
      return {
        subject: `📜 Service Agreement Ready for Digital Execution: ${data.weddingCode || 'Grand Bandhan'}`,
        html: baseTemplate(
          'Service Agreement Ready',
          `
          <div class="badge">AGREEMENT PENDING SIGNATURE</div>
          <h2 class="heading">Imperial Wedding Service Agreement</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || data.customerName || 'Valued Couple')}</strong>,</p>
          <p>Your comprehensive wedding planning and operations agreement for celebration <strong>${escapeHtml(data.weddingCode)}</strong> has been prepared.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Wedding Code:</span><span class="detail-value">${escapeHtml(data.weddingCode)}</span></div>
            <div class="detail-row"><span class="detail-label">Agreement Title:</span><span class="detail-value">${escapeHtml(data.agreementTitle || 'Full Planning & Production Contract')}</span></div>
            <div class="detail-row"><span class="detail-label">Couple:</span><span class="detail-value">${escapeHtml(data.coupleNames || 'Bride & Groom')}</span></div>
            <div class="detail-row"><span class="detail-label">Agency:</span><span class="detail-value">${escapeHtml(data.agencyName || 'Grand Bandhan Partner Agency')}</span></div>
          </div>
          <p>Please review the clauses, milestones, and deliverables, then sign digitally via your secure portal.</p>
          `,
          { label: 'Review & Sign Agreement', url: `${appUrl}/portal/client/agreement` }
        ),
        text: `Your Wedding Service Agreement for ${data.weddingCode} is ready for digital signature. Review and sign: ${appUrl}/portal/client/agreement`,
      };

    case NotificationEvent.AGREEMENT_SIGNED:
      return {
        subject: `✅ Service Agreement Digitally Executed: ${data.weddingCode} (${data.signedByName})`,
        html: baseTemplate(
          'Agreement Executed',
          `
          <div class="badge success">DIGITALLY SIGNED &amp; EXECUTED</div>
          <h2 class="heading">Contract Digitally Executed</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || 'Agency Team')}</strong>,</p>
          <p>The service contract for celebration <strong>${escapeHtml(data.weddingCode)}</strong> has been digitally signed and validated.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Wedding Code:</span><span class="detail-value">${escapeHtml(data.weddingCode)}</span></div>
            <div class="detail-row"><span class="detail-label">Signatory:</span><span class="detail-value">${escapeHtml(data.signedByName)}</span></div>
            <div class="detail-row"><span class="detail-label">Signed At:</span><span class="detail-value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span></div>
            <div class="detail-row"><span class="detail-label">Audit Log Ref:</span><span class="detail-value">Digitally Certified</span></div>
          </div>
          <p>All project milestones, quotation locks, and operational task blueprints are now legally authorized.</p>
          `,
          { label: 'View Executed Agreement', url: `${appUrl}/dashboard/agreements` }
        ),
        text: `Agreement for ${data.weddingCode} signed by ${data.signedByName}. Certified at ${new Date().toLocaleString('en-IN')}. View: ${appUrl}/dashboard/agreements`,
      };

    case NotificationEvent.BOOKING_CONFIRMED:
      return {
        subject: `👑 Wedding Celebration Confirmed! Welcome to Grand Bandhan (${data.weddingCode || ''})`,
        html: baseTemplate(
          'Booking Confirmed',
          `
          <div class="badge success">OFFICIAL BOOKING CONFIRMED</div>
          <h2 class="heading">Congratulations on Your Wedding Booking!</h2>
          <p>Dear <strong>${escapeHtml(data.coupleNames || data.clientName)}</strong>,</p>
          <p>We are thrilled to formally confirm your wedding planning partnership with Grand Bandhan. Your service agreement has been executed and your instant 25+ milestone planning blueprint has been initialized.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Wedding Code:</span><span class="detail-value">${escapeHtml(data.weddingCode)}</span></div>
            <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${data.weddingDate ? new Date(data.weddingDate).toLocaleDateString('en-IN') : 'Scheduled'}</span></div>
            <div class="detail-row"><span class="detail-label">Destination:</span><span class="detail-value">${escapeHtml(data.location)}</span></div>
            <div class="detail-row"><span class="detail-label">Package:</span><span class="detail-value">${escapeHtml(data.packageType)}</span></div>
            <div class="detail-row"><span class="detail-label">Lead Planner:</span><span class="detail-value">${escapeHtml(data.plannerName || 'Senior Planner')}</span></div>
          </div>

          <div class="card" style="border: 2px solid #D4AF37; background: #fffcf0; padding: 18px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top:0; color: #0A2540; font-size: 16px;">👑 Your Royal Client Portal Access Credentials</h3>
            <div class="detail-row"><span class="detail-label">Portal Login Email:</span><span class="detail-value"><strong>${escapeHtml(data.loginEmail || data.recipientEmail)}</strong></span></div>
            <div class="detail-row"><span class="detail-label">Default Temporary Password:</span><span class="detail-value" style="font-family: monospace; font-size: 15px; color: #8C1D40; font-weight: bold; background: #f3f3f3; padding: 2px 8px; border-radius: 4px;">${escapeHtml(data.temporaryPassword || 'RoyalClient@2026')}</span></div>
            <div class="detail-row"><span class="detail-label">Portal Direct Access:</span><span class="detail-value"><a href="${escapeHtml(data.portalUrl || `${appUrl}/portal/client`)}" style="color: #0A2540; font-weight: bold;">Open Dedicated Client Portal &rarr;</a></span></div>
            <div class="detail-row"><span class="detail-label">Standard Login URL:</span><span class="detail-value"><a href="${escapeHtml(data.loginUrl || `${appUrl}/login`)}" style="color: #D4AF37; font-weight: bold;">${appUrl}/login</a></span></div>
            <div class="detail-row"><span class="detail-label">Security Advisory:</span><span class="detail-value" style="color: #718096; font-size: 12px;">Sign in anytime with this temporary password and customize your credentials in account settings.</span></div>
          </div>

          <p>Access your dedicated royal client portal to track guest RSVPs, inspect milestone payments, review vendor quotation comparisons, and verify services.</p>
          `,
          { label: 'Access Royal Client Portal', url: data.portalUrl || `${appUrl}/portal/client` }
        ),
        text: `Wedding celebration confirmed! Code: ${data.weddingCode}. Client Login: ${data.loginEmail || data.recipientEmail}, Password: ${data.temporaryPassword || 'RoyalClient@2026'}. Portal URL: ${data.portalUrl || `${appUrl}/portal/client`}`,
      };

    case NotificationEvent.PAYMENT_RECEIVED:
      return {
        subject: `Payment Receipt: ₹${(data.amount || 0).toLocaleString('en-IN')} (${data.milestoneName || 'Milestone'})`,
        html: baseTemplate(
          'Payment Receipt',
          `
          <div class="badge success">PAYMENT CONFIRMED</div>
          <h2 class="heading">Official Payment Receipt</h2>
          <p>Dear <strong>${escapeHtml(data.clientName || 'Valued Client')}</strong>,</p>
          <p>We have successfully recorded your payment for wedding project <strong>${escapeHtml(data.weddingCode || '')}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Amount Paid:</span><span class="detail-value" style="color: #276749;">₹${(data.amount || 0).toLocaleString('en-IN')}</span></div>
            <div class="detail-row"><span class="detail-label">Milestone:</span><span class="detail-value">${escapeHtml(data.milestoneName || 'Milestone Payment')}</span></div>
            <div class="detail-row"><span class="detail-label">Payment Date:</span><span class="detail-value">${new Date().toLocaleDateString('en-IN')}</span></div>
            <div class="detail-row"><span class="detail-label">Transaction Ref:</span><span class="detail-value">${escapeHtml(data.transactionRef || 'Confirmed')}</span></div>
          </div>
          <p>Your updated financial ledger and remaining milestone balance can be viewed in your dashboard.</p>
          `,
          { label: 'View Financial Summary', url: `${appUrl}/dashboard/payments` }
        ),
        text: `Payment Receipt: ₹${(data.amount || 0).toLocaleString('en-IN')} received for ${data.weddingCode} (${data.milestoneName}). Ref: ${data.transactionRef}. View ledger: ${appUrl}/dashboard/payments`,
      };

    case NotificationEvent.PAYMENT_DUE:
      return {
        subject: `⚠️ Reminder: Milestone Payment Due — ₹${(data.amount || 0).toLocaleString('en-IN')} (${data.milestoneName || 'Payment'})`,
        html: baseTemplate(
          'Milestone Payment Due',
          `
          <div class="badge alert">PAYMENT REMINDER</div>
          <h2 class="heading">Upcoming Milestone Payment</h2>
          <p>Dear <strong>${escapeHtml(data.clientName || 'Valued Client')}</strong>,</p>
          <p>This is a friendly reminder that an upcoming milestone payment for wedding <strong>${escapeHtml(data.weddingCode)}</strong> is scheduled.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Wedding Code:</span><span class="detail-value">${escapeHtml(data.weddingCode)}</span></div>
            <div class="detail-row"><span class="detail-label">Milestone:</span><span class="detail-value">${escapeHtml(data.milestoneName)}</span></div>
            <div class="detail-row"><span class="detail-label">Amount Due:</span><span class="detail-value">₹${(data.amount || 0).toLocaleString('en-IN')}</span></div>
            <div class="detail-row"><span class="detail-label">Due Date:</span><span class="detail-value" style="color: #C53030;">${data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-IN') : 'Immediately'}</span></div>
          </div>
          <p>Timely milestone settlements ensure vendor procurement and luxury venue reservations remain locked in schedule.</p>
          `,
          { label: 'Pay Milestone Online', url: `${appUrl}/portal/client/payments` }
        ),
        text: `Payment Reminder: Milestone ${data.milestoneName} for ${data.weddingCode} of ₹${(data.amount || 0).toLocaleString('en-IN')} is due on ${data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-IN') : 'Immediately'}. Pay online: ${appUrl}/portal/client/payments`,
      };

    case NotificationEvent.PAYMENT_FAILED:
      return {
        subject: `⚠️ Urgent: Payment Attempt Failed — ${data.weddingCode || 'Grand Bandhan'}`,
        html: baseTemplate(
          'Payment Attempt Failed',
          `
          <div class="badge alert">TRANSACTION UNSUCCESSFUL</div>
          <h2 class="heading">Payment Processing Notice</h2>
          <p>Dear <strong>${escapeHtml(data.clientName || 'Valued Client')}</strong>,</p>
          <p>We encountered an issue while processing your milestone payment for wedding <strong>${escapeHtml(data.weddingCode)}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Milestone:</span><span class="detail-value">${escapeHtml(data.milestoneName || 'Milestone')}</span></div>
            <div class="detail-row"><span class="detail-label">Attempted Amount:</span><span class="detail-value">₹${(data.amount || 0).toLocaleString('en-IN')}</span></div>
            <div class="detail-row"><span class="detail-label">Reason:</span><span class="detail-value" style="color: #C53030;">${escapeHtml(data.reason || 'Bank gateway transaction declined')}</span></div>
          </div>
          <p>No funds were charged. Please re-attempt the payment with an alternate card, UPI, or NEFT bank transfer.</p>
          `,
          { label: 'Retry Payment Now', url: `${appUrl}/portal/client/payments` }
        ),
        text: `Urgent: Payment of ₹${(data.amount || 0).toLocaleString('en-IN')} for ${data.weddingCode} failed. Reason: ${data.reason || 'Declined'}. Retry: ${appUrl}/portal/client/payments`,
      };

    case NotificationEvent.TASK_ASSIGNED:
      return {
        subject: `📌 New Task Assigned: ${data.taskTitle} (${data.weddingCode || 'Wedding'})`,
        html: baseTemplate(
          'Task Assignment',
          `
          <div class="badge">TASK ASSIGNED</div>
          <h2 class="heading">New Planning Task in Your Queue</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || 'Staff Member')}</strong>,</p>
          <p>You have been assigned responsibility for a milestone task in wedding project <strong>${escapeHtml(data.weddingCode || '')}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Task:</span><span class="detail-value">${escapeHtml(data.taskTitle)}</span></div>
            <div class="detail-row"><span class="detail-label">Category:</span><span class="detail-value">${escapeHtml(data.category || 'General')}</span></div>
            <div class="detail-row"><span class="detail-label">Priority:</span><span class="detail-value">${escapeHtml(data.priority || 'MEDIUM')}</span></div>
            <div class="detail-row"><span class="detail-label">Deadline:</span><span class="detail-value">${data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-IN') : 'Scheduled'}</span></div>
          </div>
          <p>Please review task specifications and update milestone checklists as progress develops.</p>
          `,
          { label: 'Open Task in Dashboard', url: `${appUrl}/dashboard/tasks` }
        ),
        text: `New Task Assigned: ${data.taskTitle} for ${data.weddingCode}. Priority: ${data.priority || 'MEDIUM'}. Due: ${data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-IN') : 'Scheduled'}. Dashboard: ${appUrl}/dashboard/tasks`,
      };

    case NotificationEvent.TASK_OVERDUE:
      return {
        subject: `🚨 OVERDUE Task Alert: ${data.taskTitle} (${data.weddingCode || 'Wedding'})`,
        html: baseTemplate(
          'Task Overdue Alert',
          `
          <div class="badge alert">DEADLINE EXCEEDED</div>
          <h2 class="heading">Milestone Task Exceeded Deadline</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || 'Planner')}</strong>,</p>
          <p>The following planning task for wedding <strong>${escapeHtml(data.weddingCode || '')}</strong> is past its scheduled completion date.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Task:</span><span class="detail-value">${escapeHtml(data.taskTitle)}</span></div>
            <div class="detail-row"><span class="detail-label">Scheduled Due Date:</span><span class="detail-value" style="color: #C53030;">${data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-IN') : 'Overdue'}</span></div>
            <div class="detail-row"><span class="detail-label">Assignee:</span><span class="detail-value">${escapeHtml(data.assignedTo || 'Unassigned')}</span></div>
          </div>
          <p>Please resolve this task immediately or adjust the timeline to prevent downstream delays in vendor delivery.</p>
          `,
          { label: 'Resolve Task Immediately', url: `${appUrl}/dashboard/tasks` }
        ),
        text: `🚨 Overdue Task: ${data.taskTitle} for ${data.weddingCode} was due on ${data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-IN') : 'Past'}. Resolve: ${appUrl}/dashboard/tasks`,
      };

    case NotificationEvent.EVENT_REMINDER:
      return {
        subject: `🔔 Celebration Itinerary Alert: ${data.eventTitle} (${data.weddingCode || 'Grand Bandhan'})`,
        html: baseTemplate(
          'Event Itinerary Alert',
          `
          <div class="badge">UPCOMING EVENT</div>
          <h2 class="heading">Upcoming Wedding Event Itinerary</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || 'Valued Member')}</strong>,</p>
          <p>This is an automated operational alert for the upcoming event <strong>${escapeHtml(data.eventTitle)}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Event:</span><span class="detail-value">${escapeHtml(data.eventTitle)}</span></div>
            <div class="detail-row"><span class="detail-label">Date &amp; Time:</span><span class="detail-value">${data.startTime ? new Date(data.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Today'} IST</span></div>
            <div class="detail-row"><span class="detail-label">Venue / Location:</span><span class="detail-value">${escapeHtml(data.venue || 'Wedding Venue')}</span></div>
            <div class="detail-row"><span class="detail-label">Responsible Lead:</span><span class="detail-value">${escapeHtml(data.coordinatorName || 'Senior Coordinator')}</span></div>
          </div>
          <p>All teams, luxury vendors, and transport shuttles are operating on active sync.</p>
          `,
          { label: 'View Live Event Timeline', url: `${appUrl}/dashboard/timeline` }
        ),
        text: `Event Reminder: ${data.eventTitle} starts at ${data.startTime ? new Date(data.startTime).toLocaleString('en-IN') : 'Soon'} at ${data.venue || 'Venue'}. View live timeline: ${appUrl}/dashboard/timeline`,
      };

    case NotificationEvent.VENDOR_ARRIVAL_DELAYED:
      return {
        subject: `⚠️ Gate Checkpoint Alert: Vendor Arrival Delayed (${data.vendorName})`,
        html: baseTemplate(
          'Vendor Arrival Alert',
          `
          <div class="badge alert">ARRIVAL DELAY DETECTED</div>
          <h2 class="heading">Gate Radar Checkpoint Notification</h2>
          <p>Dear <strong>${escapeHtml(data.vendorName || 'Vendor Team')}</strong>,</p>
          <p>Gate security and event coordination have logged an arrival discrepancy for event <strong>${escapeHtml(data.eventTitle || 'Scheduled Ceremony')}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Vendor:</span><span class="detail-value">${escapeHtml(data.vendorName)}</span></div>
            <div class="detail-row"><span class="detail-label">Event:</span><span class="detail-value">${escapeHtml(data.eventTitle)}</span></div>
            <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value" style="color: #C53030;">${escapeHtml(data.status || 'DELAYED')}</span></div>
            <div class="detail-row"><span class="detail-label">Reported Delay:</span><span class="detail-value">${escapeHtml(data.delayMinutes || '30+')} Minutes</span></div>
            <div class="detail-row"><span class="detail-label">Gate Notes:</span><span class="detail-value">${escapeHtml(data.notes || 'Checkpoint arrival overdue')}</span></div>
          </div>
          <p>Please contact the onsite event coordinator immediately to confirm revised setup time.</p>
          `
        ),
        text: `Vendor Arrival Alert: ${data.vendorName} marked ${data.status || 'DELAYED'} for ${data.eventTitle}. Delay: ${data.delayMinutes || 'Unknown'} mins. Notes: ${data.notes || 'Late arrival'}.`,
      };

    case NotificationEvent.SERVICE_VERIFICATION_REQUESTED:
      return {
        subject: `🔍 Service Verification Requested: ${data.serviceName} (${data.weddingCode || 'Wedding Day'})`,
        html: baseTemplate(
          'Service Verification Requested',
          `
          <div class="badge">VERIFICATION ACTION REQUIRED</div>
          <h2 class="heading">Onsite Service Delivery Verification</h2>
          <p>Dear <strong>${escapeHtml(data.recipientName || data.vendorName || 'Partner Vendor')}</strong>,</p>
          <p>Service verification has been requested for <strong>${escapeHtml(data.serviceName)}</strong> at wedding <strong>${escapeHtml(data.weddingCode || '')}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Service:</span><span class="detail-value">${escapeHtml(data.serviceName)}</span></div>
            <div class="detail-row"><span class="detail-label">Vendor:</span><span class="detail-value">${escapeHtml(data.vendorName)}</span></div>
            <div class="detail-row"><span class="detail-label">Scheduled Time:</span><span class="detail-value">${data.scheduledTime ? new Date(data.scheduledTime).toLocaleTimeString('en-IN') : 'Now'}</span></div>
          </div>
          <p>Please scan your service QR code with the onsite coordinator or upload proof of delivery to certify completion.</p>
          `,
          { label: 'Confirm Service Delivery', url: `${appUrl}/vendor/verify` }
        ),
        text: `Service Verification Requested: ${data.serviceName} (${data.vendorName}) for ${data.weddingCode}. Confirm delivery: ${appUrl}/vendor/verify`,
      };

    case NotificationEvent.SERVICE_ISSUE_REPORTED:
      return {
        subject: `⚠️ Service Discrepancy Escalated: ${data.serviceName} (${data.vendorName})`,
        html: baseTemplate(
          'Service Issue Escalated',
          `
          <div class="badge alert">SERVICE DISCREPANCY</div>
          <h2 class="heading">Urgent Service Delivery Issue Logged</h2>
          <p>Dear <strong>${escapeHtml(data.vendorName || 'Partner')}</strong>,</p>
          <p>An issue has been flagged regarding service <strong>${escapeHtml(data.serviceName)}</strong> during onsite wedding verification.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Service:</span><span class="detail-value">${escapeHtml(data.serviceName)}</span></div>
            <div class="detail-row"><span class="detail-label">Vendor:</span><span class="detail-value">${escapeHtml(data.vendorName)}</span></div>
            <div class="detail-row"><span class="detail-label">Reported Notes:</span><span class="detail-value" style="color: #C53030;">${escapeHtml(data.issueNotes || 'Discrepancy logged by client or coordinator')}</span></div>
          </div>
          <p>Immediate rectification is required to avoid financial escrow holdbacks during final settlement.</p>
          `
        ),
        text: `Service Issue Flagged: ${data.serviceName} (${data.vendorName}). Notes: ${data.issueNotes || 'Discrepancy reported'}. Contact agency coordinator immediately.`,
      };

    case NotificationEvent.SERVICE_ISSUE_RESOLVED:
      return {
        subject: `✅ Service Issue Resolved: ${data.serviceName} (${data.outcome || 'RESOLVED'})`,
        html: baseTemplate(
          'Service Issue Resolved',
          `
          <div class="badge success">DISCREPANCY RESOLVED</div>
          <h2 class="heading">Service Discrepancy Case Closed</h2>
          <p>Dear <strong>${escapeHtml(data.vendorName || 'Partner Vendor')}</strong>,</p>
          <p>The reported issue regarding service <strong>${escapeHtml(data.serviceName)}</strong> has been formally updated.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Service:</span><span class="detail-value">${escapeHtml(data.serviceName)}</span></div>
            <div class="detail-row"><span class="detail-label">Resolution Outcome:</span><span class="detail-value">${escapeHtml(data.outcome || 'RESOLVED')}</span></div>
            <div class="detail-row"><span class="detail-label">Resolution Notes:</span><span class="detail-value">${escapeHtml(data.notes || 'Mutually verified and resolved')}</span></div>
          </div>
          <p>Audit records have been updated to reflect this resolution.</p>
          `
        ),
        text: `Service Issue Resolved: ${data.serviceName}. Outcome: ${data.outcome || 'RESOLVED'}. Notes: ${data.notes || 'Resolved'}.`,
      };

    case NotificationEvent.VENDOR_SETTLEMENT_COMPLETED:
      return {
        subject: `💰 Vendor Settlement Disbursed: ₹${(data.amount || 0).toLocaleString('en-IN')} (${data.vendorName})`,
        html: baseTemplate(
          'Settlement Disbursed',
          `
          <div class="badge success">SETTLEMENT PROCESSED</div>
          <h2 class="heading">Final Financial Settlement Disbursed</h2>
          <p>Dear <strong>${escapeHtml(data.vendorName || 'Partner Vendor')}</strong>,</p>
          <p>Your payment settlement for wedding <strong>${escapeHtml(data.weddingCode || '')}</strong> has been finalized and processed.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Vendor:</span><span class="detail-value">${escapeHtml(data.vendorName)}</span></div>
            <div class="detail-row"><span class="detail-label">Settlement Amount:</span><span class="detail-value" style="color: #276749;">₹${(data.amount || 0).toLocaleString('en-IN')}</span></div>
            <div class="detail-row"><span class="detail-label">Payment Mode:</span><span class="detail-value">${escapeHtml(data.paymentMethod || 'Bank NEFT/RTGS')}</span></div>
            <div class="detail-row"><span class="detail-label">Transaction Ref:</span><span class="detail-value">${escapeHtml(data.transactionRef || 'Settled')}</span></div>
          </div>
          <p>Thank you for your partnership in delivering an extraordinary celebration.</p>
          `,
          { label: 'View Settlement Summary', url: `${appUrl}/vendor/settlements` }
        ),
        text: `Settlement Disbursed: ₹${(data.amount || 0).toLocaleString('en-IN')} for ${data.vendorName} on wedding ${data.weddingCode}. Ref: ${data.transactionRef}. View: ${appUrl}/vendor/settlements`,
      };

    case NotificationEvent.VENDOR_APPLICATION_RECEIVED: {
      const isSuperAdminNotice = data.isSuperAdminNotice || data.recipientRole === 'SUPER_ADMIN';
      if (isSuperAdminNotice) {
        return {
          subject: data.subject || `👑 New Vendor Partner Application: ${data.vendorName || data.name} (${data.category})`,
          html: baseTemplate(
            'Vendor Application Submitted',
            `
            <div class="badge">VENDOR NETWORK APPLICATION</div>
            <h2 class="heading">New Vendor Partner Pending Review</h2>
            <p>Dear <strong>Super Admin Shreyansh Sharma</strong>,</p>
            <p>A new wedding vendor has applied to join the Grand Bandhan Royal Vendor Ecosystem and awaits your approval.</p>
            <div class="card">
              <div class="detail-row"><span class="detail-label">Business Name:</span><span class="detail-value">${escapeHtml(data.vendorName || data.name)}</span></div>
              <div class="detail-row"><span class="detail-label">Category:</span><span class="detail-value">${escapeHtml(data.category)}</span></div>
              <div class="detail-row"><span class="detail-label">Contact Person:</span><span class="detail-value">${escapeHtml(data.contactPerson || data.name)}</span></div>
              <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value font-mono">${escapeHtml(data.email)}</span></div>
              <div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-value">${escapeHtml(data.phone)}</span></div>
              ${data.address ? `<div class="detail-row"><span class="detail-label">City/Base:</span><span class="detail-value">${escapeHtml(data.address)}</span></div>` : ''}
              ${data.basePrice ? `<div class="detail-row"><span class="detail-label">Starting Price:</span><span class="detail-value">₹${Number(data.basePrice).toLocaleString('en-IN')}</span></div>` : ''}
            </div>
            <p>Please review their credentials and approve them to enable RFPs and bidding.</p>
            `,
            { label: 'Review in Vendor Directory', url: `${appUrl}/dashboard/vendors` }
          ),
          text: `New Vendor Application: ${data.vendorName} (${data.category}). Contact: ${data.contactPerson} (${data.phone}, ${data.email}). Review: ${appUrl}/dashboard/vendors`,
        };
      }
      return {
        subject: `👑 Grand Bandhan: Vendor Partnership Application Received (${data.vendorName || data.name})`,
        html: baseTemplate(
          'Application Received',
          `
          <div class="badge success">APPLICATION RECEIVED</div>
          <h2 class="heading">Thank You for Inquiring with Grand Bandhan</h2>
          <p>Dear <strong>${escapeHtml(data.contactPerson || data.name)}</strong>,</p>
          <p>We have successfully received your partnership application for <strong>${escapeHtml(data.vendorName || data.name)}</strong> in the <strong>${escapeHtml(data.category)}</strong> category.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Brand / Business:</span><span class="detail-value">${escapeHtml(data.vendorName || data.name)}</span></div>
            <div class="detail-row"><span class="detail-label">Category:</span><span class="detail-value">${escapeHtml(data.category)}</span></div>
            <div class="detail-row"><span class="detail-label">Registry Status:</span><span class="detail-value" style="color: #B7791F;">Pending Verification</span></div>
          </div>
          <p>Our vendor curation committee and Super Admin are reviewing your portfolio. Once approved, you will receive an official confirmation and will begin receiving luxury palace wedding RFPs.</p>
          `,
          { label: 'Visit Grand Bandhan', url: `${appUrl}` }
        ),
        text: `Vendor Application Received for ${data.vendorName || data.name} (${data.category}). Our team is reviewing your profile. Visit: ${appUrl}`,
      };
    }

    case NotificationEvent.VENDOR_APPROVED:
      return {
        subject: `🎉 Welcome to Grand Bandhan: Your Vendor Partnership is Approved! (${data.vendorName || data.name})`,
        html: baseTemplate(
          'Vendor Approved',
          `
          <div class="badge success">VERIFIED ROYAL PARTNER</div>
          <h2 class="heading">Congratulations! Your Partnership is Approved</h2>
          <p>Dear <strong>${escapeHtml(data.contactPerson || data.name)}</strong>,</p>
          <p>We are thrilled to welcome <strong>${escapeHtml(data.vendorName || data.name)}</strong> into the Grand Bandhan Royal Vendor Ecosystem.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Partner Name:</span><span class="detail-value">${escapeHtml(data.vendorName || data.name)}</span></div>
            <div class="detail-row"><span class="detail-label">Category:</span><span class="detail-value">${escapeHtml(data.category)}</span></div>
            <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value" style="color: #276749;">Verified &amp; Active Partner</span></div>
          </div>

          <div class="card" style="border: 2px solid #D4AF37; background: #fffcf0; padding: 18px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top:0; color: #0A2540; font-size: 16px;">🔐 Your Vendor Partner Access Credentials</h3>
            <div class="detail-row"><span class="detail-label">Portal Login Email:</span><span class="detail-value"><strong>${escapeHtml(data.loginEmail || data.email)}</strong></span></div>
            <div class="detail-row"><span class="detail-label">Default Temporary Password:</span><span class="detail-value" style="font-family: monospace; font-size: 15px; color: #8C1D40; font-weight: bold; background: #f3f3f3; padding: 2px 8px; border-radius: 4px;">${escapeHtml(data.temporaryPassword || 'GrandVendor@2026')}</span></div>
            <div class="detail-row"><span class="detail-label">Direct Portal Link:</span><span class="detail-value"><a href="${escapeHtml(data.portalUrl || `${appUrl}/portal/vendor`)}" style="color: #0A2540; font-weight: bold;">Open Vendor Sealed Bidding Portal &rarr;</a></span></div>
            <div class="detail-row"><span class="detail-label">Standard Login URL:</span><span class="detail-value"><a href="${escapeHtml(data.loginUrl || `${appUrl}/login`)}" style="color: #D4AF37; font-weight: bold;">${appUrl}/login</a></span></div>
            <div class="detail-row"><span class="detail-label">Security Advisory:</span><span class="detail-value" style="color: #718096; font-size: 12px;">Sign in anytime using your temporary password and update your credentials under Profile Settings.</span></div>
          </div>

          <p>You can access your vendor bidding portal directly with the button below, or log in anytime using your official email and password.</p>
          <p>You are now eligible to receive 3-quote RFP requests, submit live competitive bids, and coordinate palace wedding execution across Rajasthan and India.</p>
          `,
          { label: 'Access Vendor Portal Now', url: data.portalUrl || `${appUrl}/portal/vendor` }
        ),
        text: `Congratulations! ${data.vendorName || data.name} is approved. Sign in with Email: ${data.loginEmail || data.email}, Password: ${data.temporaryPassword || 'GrandVendor@2026'}. Portal: ${data.portalUrl || `${appUrl}/portal/vendor`}`,
      };

    case NotificationEvent.PROFILE_UPDATED:
      return {
        subject: '🔒 Imperial Security: Your Profile Was Updated',
        html: baseTemplate(
          'Profile Updated',
          `
          <div class="badge">SECURITY NOTIFICATION</div>
          <h2 class="heading">Account Information Changed</h2>
          <p>Dear <strong>${escapeHtml(data.name || 'Imperial Member')}</strong>,</p>
          <p>Your Grand Bandhan user profile settings were successfully updated.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Updated Fields:</span><span class="detail-value">${escapeHtml(data.updatedFields || 'Profile Information')}</span></div>
            <div class="detail-row"><span class="detail-label">Timestamp:</span><span class="detail-value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span></div>
          </div>
          <p>If you did not perform this change, please contact platform security immediately at <a href="mailto:security@grandbandhan.com">security@grandbandhan.com</a>.</p>
          `,
          { label: 'Review Profile Settings', url: `${appUrl}/dashboard/profile` }
        ),
        text: `Your Grand Bandhan profile was updated. Fields: ${data.updatedFields || 'Profile details'}. If you did not make this change, contact security@grandbandhan.com.`,
      };

    default: {
      const eventName = String(event).replace(/_/g, ' ');
      return {
        subject: data.subject || `Grand Bandhan Notification: ${eventName}`,
        html: baseTemplate(
          'Grand Bandhan Notification',
          `
          <h2 class="heading">${escapeHtml(eventName)}</h2>
          <p>Hello <strong>${escapeHtml(data.recipientName || 'Valued Member')}</strong>,</p>
          <p>${escapeHtml(data.message || 'You have a new update regarding your wedding planning project.')}</p>
          <div class="card">
            ${Object.entries(data.details || {}).map(([k, v]) => `
              <div class="detail-row"><span class="detail-label">${escapeHtml(k)}:</span><span class="detail-value">${escapeHtml(v)}</span></div>
            `).join('')}
          </div>
          `,
          data.actionUrl ? { label: data.actionLabel || 'View Details', url: data.actionUrl } : undefined
        ),
        text: `Grand Bandhan Notification: ${eventName}\n${data.message || 'You have an update.'}`,
      };
    }
  }
}
