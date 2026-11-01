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
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

const LIFECYCLE_STEPS = [
  { key: 'NEW', title: '1. Enquiry Registered', desc: 'Logged in Grand Bandhan Registry' },
  { key: 'CONTACTED', title: '2. Planner Assigned', desc: 'Senior wedding specialist reviewing vision' },
  { key: 'PROPOSAL_SENT', title: '3. Bespoke Proposal', desc: 'Quotation comparison & package prepared' },
  { key: 'BOOKING_PENDING', title: '4. Agreement & Deposit', desc: 'Contract sign-off & milestone confirmation' },
  { key: 'CONVERTED', title: '5. Active Operations', desc: '26+ auto tasks & live vendor coordination' },
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

  function getStepStatus(stepKey: string, currentStatus: string) {
    const order = ['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'BOOKING_PENDING', 'CONVERTED'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'upcoming';
  }

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

                    Package Selected
                  </span>
                  <p className="font-bold text-navy-900 text-sm mt-1">
                    {enquiry.packageType === 'PARTIAL_DAY_OF' ? 'Partial / Day-Of' : 'Full-Service Royal'}
                  </p>
                  <p className="text-[10px] text-darkText/70">
                    INR {(enquiry.minBudget / 100000).toFixed(0)}L - {(enquiry.maxBudget / 100000).toFixed(0)}L
                  </p>
                </div>
              </div>

              {/* Dedicated Planner Section */}
              {enquiry.assignedPlanner ? (
                <div className="p-4 bg-navy-900 text-cream rounded-xl border border-gold/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-gradient text-navy-950 font-bold flex items-center justify-center">
                      {enquiry.assignedPlanner.name[0]}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gold-light">
                        Your Dedicated Wedding Planner
                      </span>
                      <h4 className="font-serif text-base font-bold text-cream">
                        {enquiry.assignedPlanner.name}
                      </h4>
                      <p className="text-xs text-cream-300">
                        {enquiry.assignedPlanner.email} • {enquiry.assignedPlanner.phone || '+91 98200 00002'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-navy-50 rounded-xl border border-navy-200 flex items-center gap-3 text-xs text-navy-800">
                  <Clock className="w-5 h-5 text-gold-dark flex-shrink-0" />
                  <span>
                    Our Operations Director is currently pairing your celebration parameters with the ideal senior wedding planner.
                  </span>
                </div>
              )}
            </div>

            {/* Lifecycle Progress Stepper */}
            <div className="bg-navy-900/90 border border-gold/30 rounded-2xl p-6 sm:p-8 space-y-4">
              <h3 className="font-serif text-lg font-bold text-gold-gradient flex items-center gap-2">

                <span>Wedding Execution Lifecycle</span>
              </h3>

              <div className="space-y-4">
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const status = getStepStatus(step.key, enquiry.status);
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            status === 'completed'
                              ? 'bg-emerald-500 text-navy-950'
                              : status === 'current'
                              ? 'bg-gold-gradient text-navy-950 animate-pulse'
                              : 'bg-navy-800 text-cream-400 border border-navy-700'
                          }`}
                        >
                          {status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        {idx < LIFECYCLE_STEPS.length - 1 && (
                          <div
                            className={`w-0.5 h-8 my-1 ${
                              status === 'completed' ? 'bg-emerald-500' : 'bg-navy-800'
                            }`}
                          />
                        )}
                      </div>

                      <div className="pt-0.5">
                        <p
                          className={`text-sm font-bold ${
                            status === 'current'
                              ? 'text-gold'
                              : status === 'completed'
                              ? 'text-cream'
                              : 'text-cream-400'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-cream-300 mt-0.5">{step.desc}</p>
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
