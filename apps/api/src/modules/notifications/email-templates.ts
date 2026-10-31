import { NotificationEvent } from './notification.types';

function baseTemplate(title: string, bodyContent: string, actionButton?: { label: string; url: string }): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #FAF7F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #E2D9C8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(11, 27, 61, 0.08); }
    .header { background: linear-gradient(135deg, #0B1B3D 0%, #162B55 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #D4AF37; }
    .logo-badge { display: inline-block; width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%); padding: 2px; margin-bottom: 12px; }
    .logo-inner { background-color: #0B1B3D; width: 100%; height: 100%; border-radius: 50%; line-height: 44px; font-size: 20px; color: #D4AF37; }
    .brand-title { color: #FFFFFF; font-family: Georgia, serif; font-size: 22px; font-weight: bold; letter-spacing: 1px; margin: 0; }
    .brand-subtitle { color: #D4AF37; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
    .content { padding: 36px 32px; font-size: 15px; line-height: 1.6; }
    .heading { font-family: Georgia, serif; font-size: 20px; color: #0B1B3D; margin-top: 0; margin-bottom: 18px; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: bold; border-radius: 6px; background-color: #FAF5EA; color: #8C6D23; border: 1px solid #D4AF37; margin-bottom: 16px; }
    .card { background-color: #FAF7F2; border: 1px solid #EDE6D8; border-radius: 8px; padding: 18px 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #E2D9C8; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748B; font-weight: 500; }
    .detail-value { color: #0B1B3D; font-weight: 600; text-align: right; }
    .btn-container { text-align: center; margin: 30px 0 10px; }
    .btn { display: inline-block; padding: 13px 28px; background: linear-gradient(135deg, #D4AF37 0%, #AA771C 100%); color: #0B1B3D; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 8px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.35); text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { background-color: #0B1B3D; padding: 24px 20px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid rgba(212, 175, 55, 0.3); }
    .footer a { color: #D4AF37; text-decoration: none; }
  </style>
</head>
<body>
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
        <a href="${actionButton.url}" class="btn" target="_blank">${actionButton.label}</a>
      </div>` : ''}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px;">&copy; ${new Date().getFullYear()} Grand Bandhan. Confidential &amp; Proprietary.</p>
      <p style="margin: 0;">Preserving Royal Indian Traditions with Modern Precision.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function renderEmailTemplate(event: NotificationEvent, data: Record<string, any>): { subject: string; html: string } {
  switch (event) {
    case NotificationEvent.AGENCY_REGISTERED:
      return {
        subject: `Imperial Agency Application Received — ${data.agencyName}`,
        html: baseTemplate(
          'Agency Registration Received',
          `
          <h2 class="heading">Welcome to the Imperial Network</h2>
          <p>Dear <strong>${data.ownerName || 'Agency Leader'}</strong>,</p>
          <p>We have successfully received the onboarding application for <strong>${data.agencyName}</strong> on the Grand Bandhan Platform.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Agency:</span><span class="detail-value">${data.agencyName}</span></div>
            <div class="detail-row"><span class="detail-label">City/State:</span><span class="detail-value">${data.city || 'India'}, ${data.state || ''}</span></div>
            <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value">Pending Super Admin Review</span></div>
            <div class="detail-row"><span class="detail-label">Submission Date:</span><span class="detail-value">${new Date().toLocaleDateString('en-IN')}</span></div>
          </div>
          <p>Our verification team reviews all wedding agency credentials within 24 business hours. You will receive an immediate notification once your agency operations workspace is activated.</p>
          `,
          { label: 'View Application Status', url: `${data.appUrl || 'https://grand-bandhan-theta.vercel.app'}/login` }
        ),
      };

    case NotificationEvent.AGENCY_APPROVED:
      return {
        subject: `👑 Congratulations! Your Agency Workspace is Approved — ${data.agencyName}`,
        html: baseTemplate(
          'Agency Workspace Activated',
          `
          <div class="badge">APPLICATION APPROVED</div>
          <h2 class="heading">Your Imperial Operations Workspace is Live</h2>
          <p>Dear <strong>${data.ownerName || 'Agency Administrator'}</strong>,</p>
          <p>We are delighted to confirm that <strong>${data.agencyName}</strong> has been officially approved on Grand Bandhan. Your dedicated multi-tenant workspace is fully provisioned and ready for your team.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Agency:</span><span class="detail-value">${data.agencyName}</span></div>
            <div class="detail-row"><span class="detail-label">Admin Email:</span><span class="detail-value">${data.email}</span></div>
            <div class="detail-row"><span class="detail-label">Workspace Status:</span><span class="detail-value" style="color: #15803D;">Active</span></div>
          </div>
          <p>You can now invite wedding planners, empanel luxury vendors, and start managing royal celebrations.</p>
          `,
          { label: 'Enter Agency Dashboard', url: `${data.appUrl || 'https://grand-bandhan-theta.vercel.app'}/login` }
        ),
      };

    case NotificationEvent.AGENCY_REJECTED:
      return {
        subject: `Update Regarding Your Agency Application — ${data.agencyName}`,
        html: baseTemplate(
          'Agency Application Update',
          `
          <h2 class="heading">Grand Bandhan Onboarding Review</h2>
          <p>Dear <strong>${data.ownerName || 'Applicant'}</strong>,</p>
          <p>Thank you for your interest in joining Grand Bandhan. After reviewing the credentials submitted for <strong>${data.agencyName}</strong>, our compliance team requires additional information before we can proceed.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Review Status:</span><span class="detail-value" style="color: #B91C1C;">Additional Information Needed</span></div>
            <div class="detail-row"><span class="detail-label">Reason:</span><span class="detail-value">${data.rejectionReason || 'Business verification details incomplete'}</span></div>
          </div>
          <p>Please contact our onboarding concierge at <a href="mailto:concierge@grandbandhan.com">concierge@grandbandhan.com</a> with the requested documentation.</p>
          `
        ),
      };

    case NotificationEvent.NEW_ENQUIRY_RECEIVED:
      return {
        subject: `👑 Royal Wedding Enquiry Received: ${data.referenceNumber || 'New Enquiry'}`,
        html: baseTemplate(
          'Enquiry Confirmation',
          `
          <div class="badge">ENQUIRY REFERENCE: ${data.referenceNumber || 'GB-ENQ-2026'}</div>
          <h2 class="heading">Thank You for Inquiring with Grand Bandhan</h2>
          <p>Dear <strong>${data.customerName}</strong>,</p>
          <p>It is our pleasure to receive your imperial celebration enquiry. Our senior wedding planners have been notified and are reviewing your envisioned wedding parameters.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Reference No:</span><span class="detail-value">${data.referenceNumber || 'GB-ENQ-2026'}</span></div>
            <div class="detail-row"><span class="detail-label">Wedding Date:</span><span class="detail-value">${data.weddingDate ? new Date(data.weddingDate).toLocaleDateString('en-IN') : 'Flexible'}</span></div>
            <div class="detail-row"><span class="detail-label">Destination / City:</span><span class="detail-value">${data.location || 'India'}</span></div>
            <div class="detail-row"><span class="detail-label">Expected Guests:</span><span class="detail-value">${data.guestCount || '250'} Guests</span></div>
            <div class="detail-row"><span class="detail-label">Planning Side:</span><span class="detail-value">${data.planningFor || 'Joint'}</span></div>
          </div>
          <p>Your dedicated planner will reach out within 4 business hours to arrange an initial design consultation.</p>
          `,
          { label: 'Track Enquiry Status', url: `${data.appUrl || 'https://grand-bandhan-theta.vercel.app'}/enquiry/${data.referenceNumber}` }
        ),
      };

    case NotificationEvent.ENQUIRY_ASSIGNED:
      return {
        subject: `New Wedding Lead Assigned: ${data.referenceNumber} (${data.customerName})`,
        html: baseTemplate(
          'Wedding Lead Assigned',
          `
          <h2 class="heading">New Client Assigned to Your Portfolio</h2>
          <p>Dear <strong>${data.plannerName || 'Wedding Planner'}</strong>,</p>
          <p>You have been assigned as the lead wedding planner for client <strong>${data.customerName}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Enquiry Ref:</span><span class="detail-value">${data.referenceNumber}</span></div>
            <div class="detail-row"><span class="detail-label">Client Name:</span><span class="detail-value">${data.customerName}</span></div>
            <div class="detail-row"><span class="detail-label">Contact:</span><span class="detail-value">${data.customerPhone} | ${data.customerEmail}</span></div>
            <div class="detail-row"><span class="detail-label">Target Location:</span><span class="detail-value">${data.location}</span></div>
            <div class="detail-row"><span class="detail-label">Budget Range:</span><span class="detail-value">₹${((data.minBudget || 0)/100000).toFixed(1)}L - ₹${((data.maxBudget || 0)/100000).toFixed(1)}L</span></div>
          </div>
          <p>Please initiate initial client contact and update consultation notes in your planner dashboard.</p>
          `,
          { label: 'Open Enquiry Details', url: `${data.appUrl || 'https://grand-bandhan-theta.vercel.app'}/dashboard/enquiries` }
        ),
      };

    case NotificationEvent.PROPOSAL_SENT:
      return {
        subject: `👑 Your Bespoke Wedding Proposal is Ready — Grand Bandhan (${data.proposalNumber})`,
        html: baseTemplate(
          'Wedding Proposal Ready',
          `
          <div class="badge">PROPOSAL: ${data.proposalNumber}</div>
          <h2 class="heading">Your Imperial Celebration Proposal</h2>
          <p>Dear <strong>${data.customerName}</strong>,</p>
          <p>We are delighted to present your tailored wedding proposal for your upcoming wedding in <strong>${data.location}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Package:</span><span class="detail-value">${data.packageType || 'Full-Service'}</span></div>
            <div class="detail-row"><span class="detail-label">Estimated Budget:</span><span class="detail-value">₹${(data.estimatedBudget || 0).toLocaleString('en-IN')}</span></div>
            <div class="detail-row"><span class="detail-label">Valid Until:</span><span class="detail-value">${new Date(data.validUntil).toLocaleDateString('en-IN')}</span></div>
          </div>
          <p>Review the comprehensive scope of work, milestone schedule, and vendor recommendations in your secure client portal.</p>
          `,
          { label: 'Review & Respond to Proposal', url: `${data.appUrl || 'https://grand-bandhan-theta.vercel.app'}/proposal/${data.proposalId || ''}` }
        ),
      };

    case NotificationEvent.BOOKING_CONFIRMED:
      return {
        subject: `👑 Wedding Celebration Confirmed! Welcome to Grand Bandhan (${data.weddingCode || ''})`,
        html: baseTemplate(
          'Booking Confirmed',
          `
          <div class="badge">OFFICIAL BOOKING CONFIRMED</div>
          <h2 class="heading">Congratulations on Your Wedding Booking!</h2>
          <p>Dear <strong>${data.coupleNames || data.clientName}</strong>,</p>
          <p>We are thrilled to formally confirm your wedding planning partnership with Grand Bandhan. Your service agreement has been executed and your instant 25+ milestone planning blueprint has been initialized.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Wedding Code:</span><span class="detail-value">${data.weddingCode}</span></div>
            <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${new Date(data.weddingDate).toLocaleDateString('en-IN')}</span></div>
            <div class="detail-row"><span class="detail-label">Destination:</span><span class="detail-value">${data.location}</span></div>
            <div class="detail-row"><span class="detail-label">Package:</span><span class="detail-value">${data.packageType}</span></div>
            <div class="detail-row"><span class="detail-label">Lead Planner:</span><span class="detail-value">${data.plannerName || 'Senior Planner'}</span></div>
          </div>
          <p>Access your dedicated client portal anytime to track tasks, review vendor quotation comparisons, and verify services.</p>
          `,
          { label: 'Access Client Portal', url: `${data.appUrl || 'https://grand-bandhan-theta.vercel.app'}/portal/client/${data.portalToken || ''}` }
        ),
      };

    case NotificationEvent.PAYMENT_RECEIVED:
      return {
        subject: `Payment Receipt: ₹${(data.amount || 0).toLocaleString('en-IN')} (${data.milestoneName || 'Milestone'})`,
        html: baseTemplate(
          'Payment Receipt',
          `
          <div class="badge">PAYMENT CONFIRMED</div>
          <h2 class="heading">Official Payment Receipt</h2>
          <p>Dear <strong>${data.clientName || 'Valued Client'}</strong>,</p>
          <p>We have successfully recorded your payment for wedding project <strong>${data.weddingCode || ''}</strong>.</p>
          <div class="card">
            <div class="detail-row"><span class="detail-label">Amount Paid:</span><span class="detail-value" style="color: #15803D;">₹${(data.amount || 0).toLocaleString('en-IN')}</span></div>
            <div class="detail-row"><span class="detail-label">Milestone:</span><span class="detail-value">${data.milestoneName || 'Milestone Payment'}</span></div>
            <div class="detail-row"><span class="detail-label">Payment Date:</span><span class="detail-value">${new Date().toLocaleDateString('en-IN')}</span></div>
            <div class="detail-row"><span class="detail-label">Transaction Ref:</span><span class="detail-value">${data.transactionRef || 'NEFT/UPI Confirmed'}</span></div>
          </div>
          <p>Your updated financial ledger and remaining milestone balance can be viewed in your dashboard.</p>
          `,
          { label: 'View Financial Summary', url: `${data.appUrl || 'https://grand-bandhan-theta.vercel.app'}/dashboard/payments` }
        ),
      };

    default:
      return {
        subject: data.subject || `Grand Bandhan Notification: ${event}`,
        html: baseTemplate(
          'Grand Bandhan Notification',
          `
          <h2 class="heading">${event.replace(/_/g, ' ')}</h2>
          <p>Hello <strong>${data.recipientName || 'Valued Member'}</strong>,</p>
          <p>${data.message || 'You have a new update regarding your wedding planning project.'}</p>
          <div class="card">
            ${Object.entries(data.details || {}).map(([k, v]) => `
              <div class="detail-row"><span class="detail-label">${k}:</span><span class="detail-value">${v}</span></div>
            `).join('')}
          </div>
          `,
          data.actionUrl ? { label: data.actionLabel || 'View Details', url: data.actionUrl } : undefined
        ),
      };
  }
}
