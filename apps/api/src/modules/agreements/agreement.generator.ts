/**
 * Grand Bandhan: Professional Wedding Planning & Management Service Agreement Generator
 * 
 * Generates the legally structured 20-section formal agreement between
 * Grand Bandhan Luxury Weddings & Concierge and the client couple.
 */

export interface AgreementDataParams {
  agreementNumber: string;
  agreementDate?: Date;
  agency: {
    name: string;
    registeredAddress?: string;
    contactEmail: string;
    contactPhone?: string;
    authorizedRepresentative?: string;
    gstin?: string;
  };
  client: {
    partner1Name: string;
    partner2Name?: string;
    email: string;
    phone: string;
    residentialAddress?: string;
  };
  wedding: {
    weddingCode?: string;
    weddingDate: Date | string;
    venue?: string;
    city: string;
    guestCount: number;
    numberOfFunctions?: number;
    theme?: string;
    specialRequirements?: string;
  };
  package: {
    packageType: string;
    selectedServices?: string[];
    includedDeliverables?: string[];
    excludedServices?: string[];
    additionalServices?: string[];
  };
  pricing: {
    totalPlanningFee: number;
    packagePrice: number;
    applicableTaxes: number;
    thirdPartyVendorCostsEstimate: number;
    approvedEstimatedBudget: number;
  };
  paymentMilestones: Array<{
    name: string;
    percentage: number;
    amount: number;
    dueDateDescription: string;
  }>;
  version?: number;
}

export function generateLegalAgreementContent(data: AgreementDataParams): string {
  const formattedDate = (data.agreementDate ? new Date(data.agreementDate) : new Date()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const weddingDateStr = new Date(data.wedding.weddingDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
================================================================================
          WEDDING PLANNING & MANAGEMENT SERVICE AGREEMENT
                 GRAND BANDHAN IMPERIAL CONCIERGE
================================================================================

DOCUMENT REFERENCE NUMBER: ${data.agreementNumber}
AGREEMENT EXECUTION DATE: ${formattedDate}
AGREEMENT VERSION: ${data.version || 1}.0

--------------------------------------------------------------------------------
SECTION 1: AGREEMENT REFERENCE NUMBER & JURISDICTION
--------------------------------------------------------------------------------
This formal Wedding Planning & Management Service Agreement (the "Agreement") is 
executed under reference code ${data.agreementNumber} and establishes a legally 
binding commercial and operational commitment between the undersigned Parties.

--------------------------------------------------------------------------------
SECTION 2: AGREEMENT DATE & EFFECTIVENESS
--------------------------------------------------------------------------------
This Agreement is entered into on ${formattedDate} (the "Effective Date") by and 
between the Planning Agency and the Client Couple specified herein.

--------------------------------------------------------------------------------
SECTION 3: AGENCY INFORMATION (THE "AGENCY")
--------------------------------------------------------------------------------
Legal Entity Name:        ${data.agency.name || 'Grand Bandhan Luxury Weddings LLP'}
Corporate Headquarters:   ${data.agency.registeredAddress || 'Heritage Royal Chambers, The City Palace Complex, Udaipur, Rajasthan 313001'}
Official Business Email:  ${data.agency.contactEmail}
Authorized Concierge:     ${data.agency.contactPhone || '+91 98200 00002'}
Authorized Representative:${data.agency.authorizedRepresentative || 'Shreyansh Sharma (Director of Royal Operations)'}
Tax Registration (GSTIN): ${data.agency.gstin || '08AAACG1234F1Z5'}

--------------------------------------------------------------------------------
SECTION 4: CLIENT / COUPLE INFORMATION (THE "CLIENT")
--------------------------------------------------------------------------------
Partner 1 Full Legal Name: ${data.client.partner1Name}
Partner 2 Full Legal Name: ${data.client.partner2Name || 'Intended Betrothed'}
Primary Liaison Email:     ${data.client.email}
Official Contact Number:   ${data.client.phone}
Residential Address:       ${data.client.residentialAddress || 'Address on file with Grand Bandhan Registry'}

--------------------------------------------------------------------------------
SECTION 5: WEDDING CELEBRATION SPECIFICATIONS
--------------------------------------------------------------------------------
Official Wedding Code:     ${data.wedding.weddingCode || 'GB-W-2026'}
Scheduled Celebration Date:${weddingDateStr}
Primary Destination / City:${data.wedding.city || 'Udaipur, Rajasthan'}
Designated Palace Venue:   ${data.wedding.venue || 'City Palace / Jagmandir Island Palace'}
Guaranteed Guest Capacity: ${data.wedding.guestCount} Royal Guests
Number of Master Functions:${data.wedding.numberOfFunctions || 4} Ceremonies (Mehndi, Sangeet, Haldi, Varmala & Reception)
Bespoke Wedding Theme:     ${data.wedding.theme || 'Imperial Rajputana Heritage Royal'}
Bespoke Requirements:      ${data.wedding.specialRequirements || 'Comprehensive luxury coordination with digital guest RSVP and sealed-bid vendor matrices'}

--------------------------------------------------------------------------------
SECTION 6: SELECTED WEDDING PACKAGE & DELIVERABLES
--------------------------------------------------------------------------------
Agreed Planning Package:   ${data.package.packageType === 'PARTIAL_DAY_OF' ? 'Partial / Day-of Master Coordination' : 'Full-Service Royal Imperial Wedding'}

Included Deliverables:
- Dedicated Senior Wedding Planner & 24/7 Operations Command.
- Comprehensive 3-vendor transparent quotation matrices across catering, decor, photography, and sound.
- Digital Guest Roster & RSVP portal with dietary and palace suite management.
- Master Ceremony Run-of-Show timeline and multi-vendor arrival scheduling.
- On-site live service quality verification checks before milestone disbursements.
- Digital legal execution, invoice archiving, and post-wedding expense settlement.

Excluded Services (Unless specifically invoiced via Supplemental Addendum):
- Direct guest travel airfare / commercial airline bookings.
- Unscheduled post-midnight sound permissions beyond local municipal ordinances.
- Purchase of personal bridal couture, heirloom jewelry, or private luxury assets.

--------------------------------------------------------------------------------
SECTION 7: DETAILED SCOPE OF SERVICES
--------------------------------------------------------------------------------
The Agency shall exercise the highest standard of professional care to execute:
1. Architectural Theme Conception & 3D Mood-Boards.
2. Sourcing, background-auditing, and contract negotiations with licensed premium vendors.
3. Logistics, guest hospitality arrivals, room allocation concierge, and welcome hampers.
4. Technical production, acoustic engineering, ceremonial pyrotechnics, and mandap engineering.
5. Wedding-day master choreography, artist liaison, and guest management.
6. Post-event reconciliations, vendor security deposit recovery, and verified final financial ledger.

--------------------------------------------------------------------------------
SECTION 8: COMMERCIAL TERMS & PRICING
--------------------------------------------------------------------------------
Agreed Agency Planning Fee:       INR ${data.pricing.totalPlanningFee.toLocaleString('en-IN')}
Selected Package Base:            INR ${data.pricing.packagePrice.toLocaleString('en-IN')}
Applicable Statutory Taxes (GST): INR ${data.pricing.applicableTaxes.toLocaleString('en-IN')}
Estimated Third-Party Production: INR ${data.pricing.thirdPartyVendorCostsEstimate.toLocaleString('en-IN')}
Approved Total Wedding Budget:    INR ${data.pricing.approvedEstimatedBudget.toLocaleString('en-IN')}

All pricing is verified against the agreed proposal. No unauthorized fees or hidden surcharges shall be assessed.

--------------------------------------------------------------------------------
SECTION 9: PAYMENT TERMS & MILESTONE SCHEDULE
--------------------------------------------------------------------------------
Payments shall be disbursed into the designated Grand Bandhan Escrow Account strictly adhering to the milestone schedule below:

${data.paymentMilestones.map((m, idx) => `Milestone ${idx + 1}: ${m.name} (${m.percentage}%)\n  Amount: INR ${m.amount.toLocaleString('en-IN')}\n  Disbursement Due: ${m.dueDateDescription}`).join('\n\n')}

Late Payment Terms: Payments overdue by more than seven (7) banking days shall accrue interest at 1.5% per month. Unpaid milestone disbursements may cause temporary suspension of third-party vendor production schedules.

--------------------------------------------------------------------------------
SECTION 10: CLIENT RESPONSIBILITIES
--------------------------------------------------------------------------------
The Client agrees to:
1. Provide truthful and prompt ceremonial and guest information.
2. Review and formally approve vendor quotation selections within three (3) business days of presentation.
3. Remit milestone payments strictly as stipulated in Section 9.
4. Ensure bridal party and family cooperation with the operations timetable during live events.

--------------------------------------------------------------------------------
SECTION 11: AGENCY RESPONSIBILITIES
--------------------------------------------------------------------------------
The Agency agrees to:
1. Maintain undivided fiduciary loyalty and transparency in all vendor procurement.
2. Conduct live verification inspections of vendor deliverables before authorizing payments.
3. Provide weekly planning milestone reports to the Client.
4. Supply experienced, uniformed operations personnel on-site for all scheduled functions.

--------------------------------------------------------------------------------
SECTION 12: VENDOR MANAGEMENT TERMS
--------------------------------------------------------------------------------
1. All third-party vendors (decorators, caterers, photographers) are engaged under formal subcontractor agreements.
2. In the event of unforeseen default, emergency, or illness of a vendor, the Agency shall immediately deploy a vetted replacement of equal or superior caliber without operational interruption.

--------------------------------------------------------------------------------
SECTION 13: CANCELLATION & REFUND POLICY
--------------------------------------------------------------------------------
1. Client Cancellation: Notice of cancellation must be submitted in writing. The initial 25% booking deposit is non-refundable, representing initial concept development, date lock-in, and administrative outlays.
2. Advance installments paid towards third-party vendors shall be refunded strictly in accordance with each individual vendor's verified cancellation clause.
3. Agency Cancellation: In the unlikely event the Agency terminates this Agreement without cause, all unexpended funds and fees shall be refunded within fourteen (14) banking days.

--------------------------------------------------------------------------------
SECTION 14: CHANGES & ADDITIONAL REQUIREMENTS
--------------------------------------------------------------------------------
Any significant expansion in guest count (exceeding 10% of guaranteed capacity), addition of unlisted ceremonies, or extra operational days shall be executed via written Supplemental Change Order detailing agreed incremental fees.

--------------------------------------------------------------------------------
SECTION 15: FORCE MAJEURE
--------------------------------------------------------------------------------
Neither Party shall be held liable for failure or delay in performance resulting from Acts of God, catastrophic weather events, civil unrest, government-mandated pandemic closures, or strikes beyond reasonable control. In such events, both Parties agree to act in good faith to reschedule the celebration within twelve (12) calendar months without penalty.

--------------------------------------------------------------------------------
SECTION 16: PRIVACY & CONFIDENTIALITY
--------------------------------------------------------------------------------
Grand Bandhan maintains strict non-disclosure safeguards. Client contact data, financial details, guest lists, and security plans are protected under enterprise-grade encryption. Visual media recorded by the Agency may only be used for portfolio showcases with prior written consent of the Client Couple.

--------------------------------------------------------------------------------
SECTION 17: DISPUTE RESOLUTION & GOVERNING LAW
--------------------------------------------------------------------------------
This Agreement is governed by the laws of India. Any controversy, claim, or dispute arising out of or relating to this Agreement shall first be submitted to mutual amicable mediation. In the event mediation fails, disputes shall be adjudicated exclusively by the competent civil courts of the city wherein the Agency holds its registered headquarters.

--------------------------------------------------------------------------------
SECTION 18: GENERAL TERMS & CONDITIONS
--------------------------------------------------------------------------------
1. Severability: If any provision of this Agreement is deemed invalid or unenforceable, all remaining provisions shall remain in full force and effect.
2. Entire Agreement: This Agreement constitutes the complete and exclusive understanding of the Parties, superseding all prior oral or written representations.

--------------------------------------------------------------------------------
SECTION 19: DECLARATION & FORMAL ACCEPTANCE
--------------------------------------------------------------------------------
By executing below, the Client Couple and the Agency Authorized Representative solemnly declare that they have carefully read, fully comprehend, and unconditionally accept all terms, scopes, commercial commitments, and responsibilities detailed across Sections 1 through 18.

--------------------------------------------------------------------------------
SECTION 20: DIGITAL SIGNATURE & VERIFICATION AUDIT
--------------------------------------------------------------------------------

FOR THE CLIENT / COUPLE:
Primary Signer:           ${data.client.partner1Name}
Partner Co-Signer:        ${data.client.partner2Name || 'N/A'}
Signer IP Address:        Verified via Grand Bandhan Secure Portal
Verification Status:      PENDING / EXECUTED UNDER DIGITAL IT ACT 2000

FOR GRAND BANDHAN IMPERIAL CONCIERGE:
Authorized Signatory:     ${data.agency.authorizedRepresentative || 'Director of Operations'}
Title:                    Lead Planning Director
Corporate Seal:           GRAND BANDHAN LUXURY WEDDINGS & EVENTS

================================================================================
                    END OF FORMAL SERVICE AGREEMENT
================================================================================
`.trim();
}
