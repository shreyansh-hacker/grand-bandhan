'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  Building2,
  ArrowRight,
  FileText,
  AlertCircle,
  Video,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Lock,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

const LIFECYCLE_STEPS = [
  {
    step: 1,
    key: 'ENQUIRY_REGISTERED',
    title: '1. Enquiry Registered',
    desc: 'Logged in Grand Bandhan Registry',
  },
  {
    step: 2,
    key: 'PLANNER_ASSIGNED',
    title: '2. Planner Assigned',
    desc: 'Senior wedding specialist reviewing vision',
  },
  {
    step: 3,
    key: 'FIRST_CONSULTATION',
    title: '3. First Consultation',
    desc: 'Bespoke design session & ceremonial vision discovery',
  },
  {
    step: 4,
    key: 'BESPOKE_PROPOSAL',
    title: '4. Bespoke Proposal',
    desc: 'Quotation comparison & package prepared',
  },
  {
    step: 5,
    key: 'AGREEMENT_DEPOSIT',
    title: '5. Service Agreement & Deposit',
    desc: 'Contract sign-off & milestone confirmation',
  },
  {
    step: 6,
    key: 'ACTIVE_OPERATIONS',
    title: '6. Active Operations',
    desc: '26+ auto tasks & live vendor coordination',
  },
];

export default function EnquiryTrackingPage() {
  const params = useParams();
  const reference = params?.reference as string;

  const [enquiry, setEnquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) return;

    async function fetchEnquiry() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiRequest(`/api/enquiries/reference/${reference}`);
        if (res.success && res.data) {
          setEnquiry(res.data);
        } else {
          setError(res.message || 'Wedding enquiry reference not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Unable to load enquiry details from server.');
      } finally {
        setLoading(false);
      }
    }

    fetchEnquiry();
  }, [reference]);

  /**
   * Determine step status dynamically based on real database records
   */
  function getStepState(stepNumber: number) {
    if (!enquiry) return 'upcoming';

    const latestConsultation = enquiry.consultations?.[0];
    const latestProposal = enquiry.proposals?.[0];
    const latestAgreement = enquiry.agreements?.[0] || enquiry.convertedWedding?.agreement;
    const isConverted = enquiry.status === 'CONVERTED' || !!enquiry.convertedWeddingId;

    switch (stepNumber) {
      case 1:
        // Always completed once enquiry exists in Neon DB
        return 'completed';

      case 2:
        // Planner assigned
        if (enquiry.assignedPlanner) {
          const hasPastStage =
            latestConsultation?.status === 'COMPLETED' ||
            latestProposal ||
            latestAgreement ||
            isConverted;
          return hasPastStage ? 'completed' : 'current';
        }
        return 'current';

      case 3:
        // First Consultation
        if (latestConsultation?.status === 'COMPLETED' || enquiry.status === 'CONSULTATION_COMPLETED' || latestProposal || isConverted) {
          return 'completed';
        }
        if (latestConsultation?.status === 'SCHEDULED' || latestConsultation?.status === 'RESCHEDULED' || enquiry.status === 'CONSULTATION_SCHEDULED') {
          return 'current';
        }
        return enquiry.assignedPlanner ? 'pending' : 'upcoming';

      case 4:
        // Bespoke Proposal
        if (latestProposal?.status === 'ACCEPTED' || isConverted || enquiry.status === 'BOOKING_PENDING') {
          return 'completed';
        }
        if (latestProposal?.status === 'SENT' || enquiry.status === 'PROPOSAL_SENT') {
          return 'current';
        }
        return (latestConsultation?.status === 'COMPLETED' || enquiry.status === 'CONSULTATION_COMPLETED') ? 'pending' : 'upcoming';

      case 5:
        // Service Agreement & Deposit
        if (latestAgreement?.verificationStatus === 'VERIFIED' || latestAgreement?.status === 'VERIFIED' || isConverted) {
          return 'completed';
        }
        if (latestAgreement?.verificationStatus === 'REJECTED' || latestAgreement?.status === 'REJECTED') {
          return 'rejected';
        }
        if (latestAgreement?.status === 'SIGNED' || latestAgreement?.status === 'PENDING_VERIFICATION') {
          return 'current'; // Waiting admin verification
        }
        if (latestAgreement?.status === 'SENT' || latestAgreement?.status === 'DRAFT' || latestProposal?.status === 'ACCEPTED' || enquiry.status === 'BOOKING_PENDING') {
          return 'current';
        }
        return latestProposal?.status === 'ACCEPTED' ? 'pending' : 'upcoming';

      case 6:
        // Active Operations
        if (isConverted && (latestAgreement?.verificationStatus === 'VERIFIED' || latestAgreement?.status === 'VERIFIED')) {
          return 'current'; // Actively live
        }
        return 'upcoming';

      default:
        return 'upcoming';
    }
  }

  const latestConsultation = enquiry?.consultations?.[0];
  const latestProposal = enquiry?.proposals?.[0];
  const latestAgreement = enquiry?.agreements?.[0] || enquiry?.convertedWedding?.agreement;

  return (
    <div className="min-h-screen bg-navy-gradient text-cream">
      {/* Header */}
      <header className="border-b border-gold/30 bg-navy-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center">
            <div className="w-full h-full bg-navy-900 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-gold" />
            </div>
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-wider text-gold-gradient">
              GRAND BANDHAN
            </span>
            <span className="block text-[9px] uppercase tracking-[0.2em] text-cream-300">
              Live Celebration Tracker
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs font-semibold text-gold hover:text-white px-3 py-1.5 rounded-lg border border-gold/40 hover:bg-navy-900 transition-colors"
        >
          Staff / Client Portal Login
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {loading ? (
          <div className="p-12 text-center space-y-3 bg-cream/5 border border-gold/30 rounded-2xl">
            <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gold-light">Accessing Neon PostgreSQL secure registry...</p>
          </div>
        ) : error || !enquiry ? (
          <div className="p-8 text-center space-y-4 bg-red-950/40 border border-red-500/40 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-cream">Reference Code Not Found</h2>
            <p className="text-sm text-cream-300 max-w-md mx-auto">
              We could not find an enquiry matching reference <strong>{reference}</strong>. Please check your reference code or submit a new enquiry.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs"
              >
                <span>Return to Home & Submit Enquiry</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-cream text-navy-950 border border-gold rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold-dark">
                    Official Reference Code
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-navy-900">
                      {enquiry.referenceNumber || reference}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-navy-900 border border-gold">
                      {enquiry.status}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-darkText/60">Registered Agency</span>
                  <p className="font-serif text-lg font-bold text-navy-900">
                    {enquiry.agency?.name || 'Grand Bandhan Imperial Concierge'}
                  </p>
                  <p className="text-xs text-darkText/70">{enquiry.agency?.contactEmail}</p>
                </div>
              </div>

              {/* Couple & Wedding Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 bg-navy-50 rounded-xl border border-navy-200">
                  <span className="text-[10px] uppercase font-semibold text-darkText/70 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gold-dark" />
                    Customer Name
                  </span>
                  <p className="font-bold text-navy-900 text-sm mt-1">{enquiry.customerName}</p>
                  {enquiry.partnerName && (
                    <p className="text-xs text-darkText/80">& {enquiry.partnerName}</p>
                  )}
                </div>

                <div className="p-3.5 bg-navy-50 rounded-xl border border-navy-200">
                  <span className="text-[10px] uppercase font-semibold text-darkText/70 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                    Wedding Date
                  </span>
                  <p className="font-bold text-navy-900 text-sm mt-1">
                    {enquiry.weddingDate
                      ? new Date(enquiry.weddingDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'To Be Decided'}
                  </p>
                  <p className="text-[10px] text-darkText/70">{enquiry.isDateFlexible ? 'Flexible' : 'Fixed'}</p>
                </div>

                <div className="p-3.5 bg-navy-50 rounded-xl border border-navy-200">
                  <span className="text-[10px] uppercase font-semibold text-darkText/70 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                    Destination
                  </span>
                  <p className="font-bold text-navy-900 text-sm mt-1">{enquiry.location || 'Udaipur'}</p>
                  <p className="text-[10px] text-darkText/70">{enquiry.guestCount} Guests Planned</p>
                </div>

                <div className="p-3.5 bg-navy-50 rounded-xl border border-navy-200">
                  <span className="text-[10px] uppercase font-semibold text-darkText/70 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-gold-dark" />
                    Package Selected
                  </span>
                  <p className="font-bold text-navy-900 text-sm mt-1">
                    {enquiry.packageType === 'PARTIAL_DAY_OF' ? 'Partial / Day-Of' : 'Full-Service Royal'}
                  </p>
                  <p className="text-[10px] text-darkText/70">
                    INR {((enquiry.minBudget || 500000) / 100000).toFixed(0)}L - {((enquiry.maxBudget || 2500000) / 100000).toFixed(0)}L
                  </p>
                </div>
              </div>
            </div>

            {/* Wedding Execution Lifecycle Stepper */}
            <div className="bg-navy-900/90 border border-gold/30 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gold/20">
                <h3 className="font-serif text-xl font-bold text-gold-gradient flex items-center gap-2">
                  <Crown className="w-5 h-5 text-gold" />
                  <span>Wedding Execution Lifecycle</span>
                </h3>
                <span className="text-[10px] font-mono text-cream-300 uppercase tracking-widest">
                  Live Status Tracking
                </span>
              </div>

              <div className="space-y-6">
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const state = getStepState(step.step);

                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      {/* Step Circle Marker & Connecting Line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                            state === 'completed'
                              ? 'bg-emerald-500 text-navy-950 ring-2 ring-emerald-400'
                              : state === 'current'
                              ? 'bg-gold-gradient text-navy-950 ring-4 ring-gold/40 animate-pulse font-black'
                              : state === 'rejected'
                              ? 'bg-red-500 text-white ring-2 ring-red-400'
                              : 'bg-navy-800 text-cream-400 border border-navy-700'
                          }`}
                        >
                          {state === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-navy-950 font-bold" />
                          ) : (
                            step.step
                          )}
                        </div>

                        {idx < LIFECYCLE_STEPS.length - 1 && (
                          <div
                            className={`w-0.5 h-16 my-1.5 transition-colors ${
                              state === 'completed' ? 'bg-emerald-500' : 'bg-navy-800'
                            }`}
                          />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="pt-0.5 flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm sm:text-base font-bold ${
                              state === 'current'
                                ? 'text-gold'
                                : state === 'completed'
                                ? 'text-cream'
                                : state === 'rejected'
                                ? 'text-red-400'
                                : 'text-cream-400'
                            }`}
                          >
                            {step.title}
                          </p>

                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              state === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : state === 'current'
                                ? 'bg-gold/20 text-gold-light border border-gold/40'
                                : state === 'rejected'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : 'bg-navy-800 text-cream-400'
                            }`}
                          >
                            {state === 'completed'
                              ? 'Completed'
                              : state === 'current'
                              ? 'In Progress'
                              : state === 'rejected'
                              ? 'Action Required'
                              : 'Pending'}
                          </span>
                        </div>

                        <p className="text-xs text-cream-300 leading-relaxed">{step.desc}</p>

                        {/* STEP 2: Dedicated Planner Details */}
                        {step.step === 2 && enquiry.assignedPlanner && (
                          <div className="p-3 bg-navy-950/80 border border-gold/30 rounded-xl flex items-center justify-between gap-3 text-xs mt-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gold-gradient text-navy-950 font-bold flex items-center justify-center text-xs">
                                {enquiry.assignedPlanner.name[0]}
                              </div>
                              <div>
                                <span className="text-[10px] text-gold-light uppercase font-bold tracking-wider block">
                                  Assigned Senior Planner
                                </span>
                                <span className="font-bold text-cream text-xs">
                                  {enquiry.assignedPlanner.name}
                                </span>
                                <span className="text-cream-400 text-[11px] block">
                                  {enquiry.assignedPlanner.email}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-1 rounded bg-gold/15 text-gold-light text-[10px] font-bold">
                              Verified Specialist
                            </span>
                          </div>
                        )}

                        {/* STEP 3: Consultation Details Card */}
                        {step.step === 3 && latestConsultation && (
                          <div className="p-3.5 bg-navy-950/80 border border-gold/30 rounded-xl space-y-2 text-xs mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-light flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5 text-gold" />
                                <span>{latestConsultation.meetingType === 'IN_PERSON' ? 'In-Person Palace Session' : 'Virtual Design Video Session'}</span>
                              </span>
                              <span className="font-bold text-xs text-cream">
                                {new Date(latestConsultation.scheduledAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            {latestConsultation.meetingLink && latestConsultation.status !== 'COMPLETED' && (
                              <div className="pt-1 flex items-center gap-3">
                                <a
                                  href={latestConsultation.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-gradient text-navy-950 font-bold rounded-lg text-xs shadow-gold-glow hover:brightness-105"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Join Video Consultation</span>
                                  <ExternalLink className="w-3 h-3 ml-0.5" />
                                </a>
                              </div>
                            )}

                            {latestConsultation.status === 'COMPLETED' && (
                              <div className="text-[11px] text-emerald-300 flex items-center gap-1.5 pt-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Session Completed: Vision, Palace Themes &amp; Guest Count Recorded</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* STEP 4: Bespoke Proposal Card */}
                        {step.step === 4 && latestProposal && (
                          <div className="p-3.5 bg-navy-950/80 border border-gold/30 rounded-xl space-y-2 text-xs mt-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-gold-light">
                                Proposal #{latestProposal.proposalNumber}
                              </span>
                              <span className="font-bold text-cream">
                                Estimated Budget: ₹{(latestProposal.estimatedBudget / 100000).toFixed(1)} Lakhs
                              </span>
                            </div>
                            <div className="text-[11px] text-cream-300">
                              Status: <strong>{latestProposal.status}</strong> {latestProposal.acceptedAt && `(Accepted on ${new Date(latestProposal.acceptedAt).toLocaleDateString()})`}
                            </div>
                          </div>
                        )}

                        {/* STEP 5: Service Agreement Card */}
                        {step.step === 5 && latestAgreement && (
                          <div className="p-3.5 bg-navy-950/80 border border-gold/30 rounded-xl space-y-2 text-xs mt-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-gold-light">
                                Contract Ref: {latestAgreement.agreementNumber}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                latestAgreement.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : latestAgreement.verificationStatus === 'REJECTED'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {latestAgreement.verificationStatus || latestAgreement.status}
                              </span>
                            </div>

                            {latestAgreement.verificationStatus === 'REJECTED' && latestAgreement.rejectionReason && (
                              <p className="text-red-300 text-xs italic bg-red-950/50 p-2 rounded border border-red-500/40">
                                Correction Notice: {latestAgreement.rejectionReason}
                              </p>
                            )}

                            <div className="pt-1 flex items-center gap-3">
                              <Link
                                href="/portal/client"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-gradient text-navy-950 font-bold rounded-lg text-xs shadow-gold-glow hover:brightness-105"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{latestAgreement.status === 'VERIFIED' ? 'View Verified Contract' : 'Review & Sign Contract'}</span>
                              </Link>
                              <a
                                href={`/api/agreements/download/${latestAgreement.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gold hover:underline flex items-center gap-1"
                              >
                                <span>Preview Document</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        )}

                        {/* STEP 6: Active Operations Card */}
                        {step.step === 6 && (
                          <div className="mt-2">
                            {enquiry.convertedWedding ? (
                              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-2 text-xs text-cream">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-emerald-400" />
                                    <span>Active Wedding Operations Live ({enquiry.convertedWedding.weddingCode})</span>
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                    CONFIRMED
                                  </span>
                                </div>
                                <p className="text-cream-300 text-[11px]">
                                  26+ automated milestone planning tasks initialized with multi-vendor RFPs active.
                                </p>
                                <div className="pt-1">
                                  <Link
                                    href={`/portal/client/${enquiry.convertedWedding.id}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-gradient text-navy-950 font-bold rounded-lg text-xs shadow-gold-glow hover:brightness-105"
                                  >
                                    <span>Access Couple Portal Dashboard &rarr;</span>
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-navy-950/40 border border-navy-800 rounded-xl flex items-center gap-2.5 text-xs text-cream-400">
                                <Lock className="w-4 h-4 text-gold flex-shrink-0" />
                                <span>
                                  Active operations unlock automatically upon service agreement verification and booking deposit confirmation.
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
