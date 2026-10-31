'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Building,
  Crown,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Radio,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function VendorPortalPage() {
  const params = useParams();
  const token = params?.token as string;
  const [vendors, setVendors] = useState<any[]>([]);
  const [activeVendor, setActiveVendor] = useState<any | null>(null);
  const [quotationRequests, setQuotationRequests] = useState<any[]>([]);
  const [selectedRfp, setSelectedRfp] = useState<any | null>(null);

  // Quote Form
  const [quoteForm, setQuoteForm] = useState({
    baseAmount: 620000,
    pricePerPlate: 1750,
    extraHourRate: 20000,
    additionalCosts: 25000,
    menuDetails: 'Artisanal Mewari & Awadhi Royal Feast with 4 live interactive counters',
    includedItems: 'Live Chaat & Kebab Sigri, Artisanal Jalebi Counter, Uniformed Butler Service',
    notes: 'Pure organic farm produce sourced locally.',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadVendorData() {
      try {
        const vRes = await apiRequest('/api/vendors');
        if (vRes.success && vRes.data && vRes.data.length > 0) {
          setVendors(vRes.data);
          setActiveVendor(vRes.data[0]);
        }

        const wRes = await apiRequest('/api/weddings');
        if (wRes.success && wRes.data && wRes.data.length > 0) {
          const weddingId = wRes.data[0].id;
          const qRes = await apiRequest(`/api/quotations?weddingId=${weddingId}`);
          if (qRes.success && qRes.data) {
            setQuotationRequests(qRes.data);
            if (qRes.data.length > 0) {
              setSelectedRfp(qRes.data[0]);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadVendorData();
  }, [token]);

  async function handleSubmitQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRfp || !activeVendor) return;
    setSubmitting(true);

    try {
      const res = await apiRequest(`/api/quotations/${selectedRfp.id}/quotes`, {
        method: 'POST',
        body: JSON.stringify({
          vendorId: activeVendor.id,
          baseAmount: Number(quoteForm.baseAmount),
          pricePerPlate: Number(quoteForm.pricePerPlate),
          extraHourRate: Number(quoteForm.extraHourRate),
          additionalCosts: Number(quoteForm.additionalCosts),
          menuDetails: quoteForm.menuDetails,
          includedItems: quoteForm.includedItems.split(',').map((s) => s.trim()),
          notes: quoteForm.notes,
        }),
      });

      if (res.success) {
        alert('Quotation submitted successfully into the Three Vendors One Decision matrix!');
      } else {
        alert(res.message || 'Submission failed');
      }
    } catch (e: any) {
      alert(e.message || 'Error submitting');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream text-darkText">
      {/* Header */}
      <header className="bg-navy-900 text-white p-6 border-b border-gold/40 shadow-navy-deep">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-gradient p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-gold" />
              </div>
            </div>
            <div>
              <span className="font-serif text-xl font-bold text-gold-gradient">
                GRAND BANDHAN
              </span>
              <span className="block text-[10px] text-cream-300 uppercase tracking-widest font-semibold">
                Vendor Partner Portal
              </span>
            </div>
          </div>

          <span className="text-xs bg-gold/15 text-gold border border-gold/30 px-3 py-1 rounded-full font-bold">
            Verified Artisan Partner
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 sm:p-8 space-y-8">
        {/* Vendor Partner Card */}
        <div className="bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2.5 py-0.5 rounded-full inline-block">
            {activeVendor?.category || 'Catering'} Partner
          </span>
          <h2 className="font-serif text-3xl font-bold text-navy-900">
            {activeVendor?.name || 'Royal Partner'}
          </h2>
          <p className="text-xs text-darkText/70">
            Contact Person: <strong>{activeVendor?.contactPerson}</strong> | Phone: {activeVendor?.phone}
          </p>
        </div>

        {/* Submit Quotation Form into RFP */}
        <div className="bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-navy-100">
            <span className="text-xs font-bold uppercase tracking-wider text-royal">
              Three Vendors One Decision RFP
            </span>
            <h3 className="font-serif text-2xl font-bold text-navy-900 mt-0.5">
              Submit Quotation for {selectedRfp?.title || 'Royal Wedding Catering'}
            </h3>
            <p className="text-xs text-darkText/70 mt-1">
              Provide your competitive per-plate rate, menu scope, and extra-hour fee. Quotes are evaluated directly by the couple.
            </p>
          </div>

          <form onSubmit={handleSubmitQuote} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Base Production Fee (INR) *</label>
                <input
                  type="number"
                  required
                  value={quoteForm.baseAmount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, baseAmount: Number(e.target.value) })}
                  className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Price Per Plate (INR) *</label>
                <input
                  type="number"
                  required
                  value={quoteForm.pricePerPlate}
                  onChange={(e) => setQuoteForm({ ...quoteForm, pricePerPlate: Number(e.target.value) })}
                  className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Extra Hour Rate (INR/hr)</label>
                <input
                  type="number"
                  value={quoteForm.extraHourRate}
                  onChange={(e) => setQuoteForm({ ...quoteForm, extraHourRate: Number(e.target.value) })}
                  className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Additional Logistics / Setup (INR)</label>
                <input
                  type="number"
                  value={quoteForm.additionalCosts}
                  onChange={(e) => setQuoteForm({ ...quoteForm, additionalCosts: Number(e.target.value) })}
                  className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Menu Details & Course Highlights *</label>
              <textarea
                rows={2}
                required
                value={quoteForm.menuDetails}
                onChange={(e) => setQuoteForm({ ...quoteForm, menuDetails: e.target.value })}
                className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Included Stations / Equipment (Comma Separated)</label>
              <input
                type="text"
                value={quoteForm.includedItems}
                onChange={(e) => setQuoteForm({ ...quoteForm, includedItems: e.target.value })}
                className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting Quotation...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Sealed Quotation</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
