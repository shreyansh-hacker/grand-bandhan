'use client';

import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Crown,

  Award,
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
  X,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { QuotationRequestStatus, QuotationStatus } from '@grand-bandhan/shared';

export default function QuotationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [awardingId, setAwardingId] = useState<string | null>(null);

  // New Quote Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    vendorName: '',
    baseAmount: 650000,
    pricePerPlate: 1800,
    extraHourRate: 25000,
    additionalCosts: 30000,
    menuDetails: 'Royal Rajasthani & Continental Gourmet Buffet',
    includedItems: 'Live Chaat Counter, Passed Hors d\'oeuvres, Dessert Bar',
    notes: 'Premium setup with copper chafing dishes',
  });

  async function loadQuotationRequests() {
    try {
      // First find active weddings
      const wRes = await apiRequest('/api/weddings');
      if (wRes.success && wRes.data && wRes.data.length > 0) {
        const weddingId = wRes.data[0].id;
        const qRes = await apiRequest(`/api/quotations?weddingId=${weddingId}`);
        if (qRes.success && qRes.data) {
          setRequests(qRes.data);
          if (qRes.data.length > 0) {
            setSelectedRequest(qRes.data[0]);
            loadComparison(qRes.data[0].id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadComparison(requestId: string) {
    try {
      const res = await apiRequest(`/api/quotations/${requestId}/comparison`);
      if (res.success && res.data) {
        setComparisonData(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadQuotationRequests();
  }, []);

  async function handleSelectFinalQuotation(quoteId: string) {
    if (!selectedRequest) return;
    if (!confirm('Are you sure you want to award this quotation? Other competing quotes will be automatically closed, and this vendor will be linked to the wedding.')) {
      return;
    }

    setAwardingId(quoteId);
    try {
      const res = await apiRequest(`/api/quotations/${selectedRequest.id}/select`, {
        method: 'POST',
        body: JSON.stringify({
          selectedQuotationId: quoteId,
          selectionNotes: 'Selected via Three Vendors One Decision workflow.',
        }),
      });

      if (res.success) {
        alert(res.message || 'Vendor awarded successfully!');
        loadComparison(selectedRequest.id);
        loadQuotationRequests();
      } else {
        alert(res.message || 'Failed to award quotation');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with server');
    } finally {
      setAwardingId(null);
    }
  }

  const quotes = comparisonData?.quotations || [];
  const req = comparisonData?.request || selectedRequest;
  const guestCount = req?.guestCount || 400;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <FileSpreadsheet className="w-4 h-4 text-gold-dark" />
            <span>Multiple Vendors System</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            Quotation Comparison Matrix
          </h2>
          <p className="text-xs text-darkText/70">
            Side-by-side analysis of multi-vendor bids. Compare price per plate, menu scope, and extra-hour fees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {requests.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setSelectedRequest(r);
                loadComparison(r.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedRequest?.id === r.id
                  ? 'bg-navy-900 text-gold shadow-sm'
                  : 'bg-white border border-navy-200 text-darkText hover:border-gold'
              }`}
            >
              {r.category}: {r.title.slice(0, 20)}...
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Rule Alert Box */}
      <div className="bg-navy-900 text-white p-4 rounded-xl border border-gold/40 flex items-start gap-3 text-xs shadow-md">

        <div className="space-y-1">
          <div className="font-bold text-gold uppercase tracking-wider">
            Mandatory Decision Protocol
          </div>
          <p className="text-cream-300 leading-relaxed">
            The agency planner inspects menu depth and flags recommendations (★). The couple retains final authoritative selection. Awarding a vendor immediately binds the contract to the wedding ledger and automatically closes competing quotes while preserving full audit history.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-navy-900">
              {req?.title || 'Royal Catering RFP'}
            </h3>
            <p className="text-xs text-darkText/70">
              Category: <strong>{req?.category}</strong> | Guaranteed Guests: <strong>{guestCount} Guests</strong> | Status: <span className="font-bold uppercase text-royal">{req?.status}</span>
            </p>
          </div>
        </div>

        {/* 3-Column Side-by-Side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quotes.map((q: any, idx: number) => {
            const isSelected = q.status === QuotationStatus.SELECTED;
            const isClosed = q.status === QuotationStatus.CLOSED || q.status === QuotationStatus.REJECTED;
            const totalWithPlate = q.computedTotal || (q.baseAmount + (q.pricePerPlate ? q.pricePerPlate * guestCount : 0));

            return (
              <div
                key={q.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                  isSelected
                    ? 'bg-navy-950 text-white border-2 border-gold shadow-gold-glow'
                    : isClosed
                    ? 'bg-white/70 border border-navy-200 opacity-60'
                    : 'bg-white border-2 border-gold/40 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Badges */}
                <div className="flex items-center justify-between pb-3 border-b border-navy-200/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-100 text-navy-900">
                    Option {idx + 1}
                  </span>

                  {isSelected && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-gradient text-navy-950 shadow-sm flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>Awarded Vendor</span>
                    </span>
                  )}

                  {q.isAgencyRecommended && !isSelected && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      ★ Planner Recommended
                    </span>
                  )}

                  {isClosed && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-navy-100 text-darkText/60">
                      Auto-Closed
                    </span>
                  )}
                </div>

                {/* Vendor Identity & Pricing Header */}
                <div className="mt-3 space-y-2">
                  <h4 className={`font-serif text-lg font-bold ${isSelected ? 'text-cream' : 'text-navy-900'}`}>
                    {q.vendor?.name || `Vendor Option ${idx + 1}`}
                  </h4>
                  <div className="text-xs text-darkText/60">
                    Rating: ★ <strong>{q.vendor?.rating || 4.9}</strong> | {q.vendor?.address || 'Udaipur, Rajasthan'}
                  </div>

                  {/* Highlighted Price Per Plate */}
                  <div className="p-3 rounded-xl bg-navy-50/80 border border-gold/30 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-royal block">
                      Price Per Plate (400 Guests)
                    </span>
                    <div className="font-serif text-2xl font-bold text-navy-900 mt-0.5">
                      {q.pricePerPlate ? `₹${q.pricePerPlate.toLocaleString()}` : 'Package Base'}
                      <span className="text-xs font-normal text-darkText/70"> / plate</span>
                    </div>
                    <div className="text-[11px] text-royal font-semibold mt-1">
                      Computed Total: <strong>₹{totalWithPlate.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Itemized Comparison Table */}
                <div className="my-4 space-y-2 text-xs border-y border-navy-100 py-3">
                  <div className="flex justify-between items-center text-darkText/80">
                    <span className="font-medium">Base Production Fee:</span>
                    <span className="font-bold">₹{q.baseAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-darkText/80">
                    <span className="font-medium">Extra Hour Rate:</span>
                    <span className="font-bold">
                      {q.extraHourRate ? `₹${q.extraHourRate.toLocaleString()}/hr` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-darkText/80">
                    <span className="font-medium">Additional Setup Costs:</span>
                    <span className="font-bold">₹{(q.additionalCosts || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Menu Details & Inclusions */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-navy-900 uppercase tracking-wider text-[10px] block">
                    Menu & Inclusions Scope:
                  </span>
                  <p className={`text-[11px] leading-relaxed italic ${isSelected ? 'text-cream-300' : 'text-darkText/80'}`}>
                    &quot;{q.menuDetails || 'Complete multi-course royal dining setup with live counters.'}&quot;
                  </p>

                  <div className="space-y-1 pt-1">
                    {(q.includedItems || []).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {q.notes && (
                    <div className="pt-2 text-[10px] text-darkText/60 border-t border-navy-100">
                      Notes: {q.notes}
                    </div>
                  )}
                </div>

                {/* Selection Action Button */}
                <div className="mt-6 pt-4 border-t border-navy-100">
                  {isSelected ? (
                    <div className="w-full py-2.5 rounded-lg bg-green-900/60 text-green-300 border border-green-500 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                      <span>Awarded & Bound to Wedding</span>
                    </div>
                  ) : isClosed ? (
                    <div className="w-full py-2 text-center text-xs text-darkText/50 font-medium">
                      Archived in Quotation History
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectFinalQuotation(q.id)}
                      disabled={awardingId === q.id}
                      className="w-full py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {awardingId === q.id ? (
                        <span>Awarding Contract...</span>
                      ) : (
                        <>
                          <Award className="w-4 h-4" />
                          <span>Award Vendor & Lock Quote</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
