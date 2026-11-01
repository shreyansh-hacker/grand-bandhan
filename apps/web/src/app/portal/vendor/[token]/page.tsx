'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Building,
  Crown,

  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Radio,
  Send,
  ShieldCheck,
  Calendar,
  MapPin,
  Users,
  Coins,
  ChevronRight,
  ExternalLink,
  Tag,
  FileText,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function VendorPortalPage() {
  const params = useParams();
  const token = params?.token as string;

  const [vendor, setVendor] = useState<any | null>(null);
  const [rfps, setRfps] = useState<any[]>([]);
  const [selectedRfp, setSelectedRfp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'RFPS' | 'SUBMIT_BID'>('RFPS');

  // Quote Form
  const [quoteForm, setQuoteForm] = useState({
    baseAmount: 350000,
    pricePerPlate: 1850,
    extraHourRate: 25000,
    additionalCosts: 45000,
    menuDetails: 'Artisanal Mewari & Awadhi Royal Feast with 4 live interactive counters',
    includedItems: 'Live Chaat & Kebab Sigri, Artisanal Jalebi Counter, Uniformed Butler Service, Imperial Cutlery',
    notes: 'All dairy and vegetables sourced from certified organic farms. Overtime billed pro-rata.',
    portfolioPdfUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  async function loadVendorPortalData() {
    try {
      setLoading(true);
      let targetVendorId = token;

      // If token not in route, check logged-in vendor from storage or API
      if (!targetVendorId || targetVendorId === 'current') {
        const vRes = await apiRequest('/api/vendors');
        if (vRes.success && vRes.data && vRes.data.length > 0) {
          targetVendorId = vRes.data[0].id;
        }
      }

      // Fetch vendor RFPs via endpoint
      const res = await apiRequest(`/api/quotations/vendor-rfps/${targetVendorId || 'all'}`);
      if (res.success && res.data) {
        if (res.data.vendor) {
          setVendor(res.data.vendor);
        }
        if (res.data.rfps && res.data.rfps.length > 0) {
          setRfps(res.data.rfps);
          setSelectedRfp(res.data.rfps[0]);
        }
      }

      // If vendor still not set, fetch vendor by id directly
      if (targetVendorId && !vendor) {
        const vendorRes = await apiRequest(`/api/vendors/${targetVendorId}`).catch(() => null);
        if (vendorRes?.success && vendorRes.data) {
          setVendor(vendorRes.data);
        }
      }
    } catch (e) {
      console.error('Vendor Portal load error:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendorPortalData();
  }, [token]);

  // Compute live estimated total
  const guestCount = selectedRfp?.guestCount || selectedRfp?.wedding?.guestCount || 350;
  const plateCalculated = (Number(quoteForm.pricePerPlate) || 0) * guestCount;
  const computedTotalEstimate =
    (Number(quoteForm.baseAmount) || 0) + plateCalculated + (Number(quoteForm.additionalCosts) || 0);

  async function handleSubmitQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRfp || !vendor) {
      alert('Please select an active RFP and ensure vendor profile is verified.');
      return;
    }
    setSubmitting(true);

    try {
      const res = await apiRequest(`/api/quotations/${selectedRfp.id}/quotes`, {
        method: 'POST',
        body: JSON.stringify({
          vendorId: vendor.id,
          baseAmount: Number(quoteForm.baseAmount),
          pricePerPlate: Number(quoteForm.pricePerPlate) || null,
          extraHourRate: Number(quoteForm.extraHourRate) || null,
          additionalCosts: Number(quoteForm.additionalCosts) || 0,
          menuDetails: quoteForm.menuDetails,
          includedItems: quoteForm.includedItems.split(',').map((s) => s.trim()).filter(Boolean),
          notes: quoteForm.notes,
        }),
      });

      if (res.success) {
        setSuccessToast(`🎉 Sealed quotation of ₹${computedTotalEstimate.toLocaleString('en-IN')} submitted into 3-Vendor Comparison Matrix!`);
        setTimeout(() => setSuccessToast(null), 6000);
        setActiveTab('RFPS');
        // Refresh RFPs
        loadVendorPortalData();
      } else {
        alert(res.message || 'Submission failed');
      }
    } catch (e: any) {
      alert(e.message || 'Error submitting quotation');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream text-darkText font-sans">
      {/* Vendor Portal Imperial Header */}
      <header className="bg-navy-900 text-white p-6 border-b border-gold/40 shadow-navy-deep">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gold-gradient p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-gold" />
              </div>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold text-gold-gradient tracking-wide">
                GRAND BANDHAN
              </span>
              <span className="block text-[10px] text-cream-300 uppercase tracking-widest font-semibold">
                Vendor Partner Quotation &amp; Bidding Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-gold/15 text-gold border border-gold/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>Verified Artisan Partner</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
        {successToast && (
          <div className="p-4 bg-green-50 border-2 border-green-400 text-green-900 rounded-2xl flex items-center justify-between shadow-md text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-green-800 hover:text-green-950">
              ✕
            </button>
          </div>
        )}

        {/* Vendor Partner Profile Card */}
        <div className="bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-3 py-0.5 rounded-full inline-block">
                {vendor?.category || 'Catering'} Partner
              </span>
              <h2 className="font-serif text-3xl font-bold text-navy-900 mt-1">
                {vendor?.name || 'Verified Vendor Partner'}
              </h2>
            </div>

            <div className="text-xs text-darkText/70 sm:text-right">
              <div>Contact Person: <strong>{vendor?.contactPerson || 'Representative'}</strong></div>
              <div>Phone: <strong>{vendor?.phone || '—'}</strong> | Email: {vendor?.email}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-navy-200 pb-2">
          <button
            onClick={() => setActiveTab('RFPS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'RFPS'
                ? 'bg-navy-900 text-gold shadow-sm'
                : 'text-darkText/70 hover:bg-cream-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Open RFPs &amp; Bidding Opportunities ({rfps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SUBMIT_BID')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SUBMIT_BID'
                ? 'bg-navy-900 text-gold shadow-sm'
                : 'text-darkText/70 hover:bg-cream-100'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Itemized Bid Studio</span>
          </button>
        </div>

        {/* TAB 1: OPEN RFPS LIST */}
        {activeTab === 'RFPS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900">
                  Three Vendors One Decision Invitations
                </h3>
                <p className="text-xs text-darkText/70">
                  Select an RFP to inspect wedding specifications, guest requirements, and submit your sealed commercial quote.
                </p>
              </div>
            </div>

            {rfps.length === 0 ? (
              <div className="bg-white border border-navy-200 rounded-2xl p-12 text-center text-xs text-darkText/70 space-y-2">
                <Clock className="w-8 h-8 text-gold mx-auto" />
                <h4 className="font-serif text-lg font-bold text-navy-900">No Open RFPs at This Moment</h4>
                <p>You will be notified via email when high-budget palace weddings request bids in your category.</p>
              </div>
            ) : (
              rfps.map((rfp) => {
                const hasExistingQuote = rfp.quotations && rfp.quotations.length > 0;
                const existingQuote = hasExistingQuote ? rfp.quotations[0] : null;

                return (
                  <div
                    key={rfp.id}
                    className="bg-white border-2 border-gold/40 rounded-2xl p-6 shadow-sm hover:border-gold transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-navy-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-royal bg-royal/10 px-2.5 py-0.5 rounded">
                            {rfp.category}
                          </span>
                          <span className="text-[10px] font-bold text-gold-dark bg-cream-200 px-2 py-0.5 rounded">
                            {rfp.wedding?.weddingCode || 'GB-WEDDING'}
                          </span>
                        </div>
                        <h4 className="font-serif text-xl font-bold text-navy-900 mt-1">
                          {rfp.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {hasExistingQuote ? (
                          <span className="px-3 py-1 bg-green-100 text-green-900 border border-green-300 font-bold text-xs rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                            <span>Bid Submitted (₹{existingQuote.baseAmount.toLocaleString('en-IN')})</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-full">
                            Pending Your Bid
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-cream-50 p-3 rounded-xl border border-navy-200/50">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-darkText/60 block">Palace Destination</span>
                        <span className="font-semibold text-navy-900 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gold-dark" />
                          <span>{rfp.wedding?.location || 'Rajasthan'}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-darkText/60 block">Event Date</span>
                        <span className="font-semibold text-navy-900 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-gold-dark" />
                          <span>{rfp.wedding?.weddingDate ? new Date(rfp.wedding.weddingDate).toLocaleDateString('en-IN') : 'Scheduled'}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-darkText/60 block">Guaranteed Guests</span>
                        <span className="font-semibold text-navy-900 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-gold-dark" />
                          <span>{rfp.guestCount || rfp.wedding?.guestCount || 350} Guests</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-darkText/60 block">Target Budget</span>
                        <span className="font-semibold text-navy-900 flex items-center gap-1 mt-0.5">
                          <Coins className="w-3 h-3 text-gold-dark" />
                          <span>{rfp.targetBudget ? `₹${rfp.targetBudget.toLocaleString('en-IN')}` : 'Market Competitive'}</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-darkText uppercase block mb-1">
                        Scope of Work &amp; Specifications:
                      </span>
                      <p className="text-xs text-darkText/80 leading-relaxed bg-cream-100 p-3 rounded-xl font-mono whitespace-pre-line border border-navy-200/50">
                        {rfp.specifications || 'Comprehensive execution according to royal standards.'}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        onClick={() => {
                          setSelectedRfp(rfp);
                          setActiveTab('SUBMIT_BID');
                        }}
                        className="px-4 py-2 bg-gold-gradient text-navy-950 font-bold rounded-xl text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center gap-1.5"
                      >
                        <span>{hasExistingQuote ? 'Revise Sealed Bid' : 'Submit Sealed Bid'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: SUBMIT BID STUDIO */}
        {activeTab === 'SUBMIT_BID' && (
          <div className="bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="pb-4 border-b border-navy-100">
              <span className="text-xs font-bold uppercase tracking-wider text-royal">
                Sealed Quotation Studio
              </span>
              <h3 className="font-serif text-2xl font-bold text-navy-900 mt-0.5">
                Submit Commercial Bid for: {selectedRfp?.title || 'Selected RFP'}
              </h3>
              <p className="text-xs text-darkText/70 mt-1">
                Your rates will be entered side-by-side with 2 other vetted vendors for transparent couple decision.
              </p>
            </div>

            {/* Live Total Forecast Banner */}
            <div className="p-4 bg-navy-950 text-white rounded-2xl border border-gold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold font-bold block">
                  Computed Total Bid Projection ({guestCount} Guests)
                </span>
                <span className="text-3xl font-serif font-bold text-gold-gradient">
                  ₹{computedTotalEstimate.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-cream-300 block mt-0.5">
                  Base: ₹{quoteForm.baseAmount.toLocaleString('en-IN')} + Plate: ₹{(quoteForm.pricePerPlate * guestCount).toLocaleString('en-IN')} + Logistics: ₹{quoteForm.additionalCosts.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-right text-xs text-cream-300 sm:border-l sm:border-gold/30 sm:pl-4">
                <div>Target Budget: <strong>₹{selectedRfp?.targetBudget?.toLocaleString('en-IN') || 'Competitive'}</strong></div>
                <div>Extra Hour Fee: <strong>₹{Number(quoteForm.extraHourRate).toLocaleString('en-IN')}/hr</strong></div>
              </div>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Base Production / Fixed Setup Fee (INR) *</label>
                  <input
                    type="number"
                    required
                    value={quoteForm.baseAmount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, baseAmount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                  />
                  <span className="text-[10px] text-darkText/60 mt-0.5 block">Covers equipment, baseline artistry, and setup crew.</span>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Unit / Price Per Plate (INR)</label>
                  <input
                    type="number"
                    value={quoteForm.pricePerPlate}
                    onChange={(e) => setQuoteForm({ ...quoteForm, pricePerPlate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                  />
                  <span className="text-[10px] text-darkText/60 mt-0.5 block">Calculated dynamically for {guestCount} guaranteed guests.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Extra Hour Rate (INR/hour)</label>
                  <input
                    type="number"
                    value={quoteForm.extraHourRate}
                    onChange={(e) => setQuoteForm({ ...quoteForm, extraHourRate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                  />
                  <span className="text-[10px] text-darkText/60 mt-0.5 block">For late night Sangeet / Baarat extensions.</span>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Logistics, Transportation &amp; Setup (INR)</label>
                  <input
                    type="number"
                    value={quoteForm.additionalCosts}
                    onChange={(e) => setQuoteForm({ ...quoteForm, additionalCosts: Number(e.target.value) })}
                    className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                  />
                  <span className="text-[10px] text-darkText/60 mt-0.5 block">Palace access fees, outstation travel, and load-in.</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Menu Scope &amp; Course Highlights *</label>
                <textarea
                  rows={3}
                  required
                  value={quoteForm.menuDetails}
                  onChange={(e) => setQuoteForm({ ...quoteForm, menuDetails: e.target.value })}
                  className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                  placeholder="Detail live cooking stations, appetizers, royal mains, artisanal desserts..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Included Stations / Equipment Deliverables (Comma-Separated)</label>
                <input
                  type="text"
                  value={quoteForm.includedItems}
                  onChange={(e) => setQuoteForm({ ...quoteForm, includedItems: e.target.value })}
                  className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                  placeholder="Live Sigri, Artisanal Jalebi Counter, Uniformed Waiters, Bone China Crockery"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Special Terms, Validity &amp; Dietary Notes</label>
                <textarea
                  rows={2}
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                  placeholder="Quote valid for 14 days; requires 3-phase palace power supply..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('RFPS')}
                  className="px-4 py-2.5 border border-navy-200 rounded-xl font-bold hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting Sealed Bid...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Sealed Quotation (₹{computedTotalEstimate.toLocaleString('en-IN')})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
