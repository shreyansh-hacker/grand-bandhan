'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,

  Send,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { EnquirySource, PlanningForSide, WeddingPackageType } from '@grand-bandhan/shared';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnquiryModal({ isOpen, onClose }: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    partnerName: '',
    email: '',
    phone: '',
    preferredContactMethod: 'WHATSAPP',
    weddingDate: '',
    isDateFlexible: false,
    location: 'Udaipur, Rajasthan',
    guestCount: 350,
    theme: 'Royal Rajputana Heritage & Gold',
    packageType: WeddingPackageType.FULL_SERVICE,
    minBudget: 2500000,
    maxBudget: 4500000,
    source: EnquirySource.WEBSITE,
    planningFor: PlanningForSide.NOT_SPECIFIED,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    referenceNumber: string;
    customerName: string;
    weddingDate?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await apiRequest('/api/enquiries/public', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success && res.referenceNumber) {
        setSubmittedData({
          referenceNumber: res.referenceNumber,
          customerName: formData.customerName,
          weddingDate: formData.weddingDate,
        });
      } else {
        setErrorMessage(res.message || 'Failed to submit enquiry');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  }

  function handleCopyReference() {
    if (submittedData?.referenceNumber && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(submittedData.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-cream border border-gold rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-navy-gradient text-white p-6 border-b border-gold/30 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-gold hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-gold text-xs font-semibold tracking-wider uppercase mb-1">

            <span>Royal Wedding Concierge</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-cream">Plan Your Imperial Celebration</h3>
          <p className="text-xs text-cream-300 mt-1">
            Submit your parameters to receive a bespoke quotation comparison and dedicated wedding planner.
          </p>
        </div>

        {/* Content Body */}
        {submittedData ? (
          <div className="p-8 text-center space-y-6 overflow-y-auto flex-1">
            <div className="w-16 h-16 bg-gold/20 text-gold-dark rounded-full flex items-center justify-center mx-auto border-2 border-gold shadow-gold-glow">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-2xl font-bold text-navy-950">
                Enquiry Registered in Imperial Registry
              </h4>
              <p className="text-sm text-darkText/80 max-w-md mx-auto">
                Thank you, <strong>{submittedData.customerName}</strong>. Your enquiry is logged in our Neon PostgreSQL persistent database.
              </p>
            </div>

            {/* Reference Number Box */}
            <div className="bg-navy-900 border-2 border-gold p-4 rounded-xl text-center space-y-2 max-w-md mx-auto shadow-gold-glow">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-light">
                Your Official Wedding Reference Code
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-xl sm:text-2xl font-black text-gold tracking-wider">
                  {submittedData.referenceNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="p-1.5 rounded-lg bg-navy-800 text-gold hover:bg-navy-700 transition-colors"
                  title="Copy reference code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-cream-300">
                Save this code to check your quotation proposals and planner assignment at any time without creating an account.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href={`/enquiry/${submittedData.referenceNumber}`}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all"
              >
                <span>Track Enquiry Status</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-lg bg-navy-100 text-navy-950 font-semibold text-sm hover:bg-navy-200 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            {errorMessage && (
              <div className="p-3 text-xs bg-red-100 border border-red-300 text-red-800 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Package Type Selection */}
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                Select Wedding Service Package:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, packageType: WeddingPackageType.FULL_SERVICE })
                  }
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.packageType === WeddingPackageType.FULL_SERVICE
                      ? 'bg-navy-900 text-gold border-gold shadow-md'
                      : 'bg-white text-navy-900 border-navy-200 hover:border-gold/50'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">Full-Service Royal</p>
                  <p className="text-[11px] opacity-80 mt-1">
                    End-to-end planning, 26 auto tasks, vendor RFPs & 3-way comparisons.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, packageType: WeddingPackageType.PARTIAL_DAY_OF })
                  }
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.packageType === WeddingPackageType.PARTIAL_DAY_OF
                      ? 'bg-navy-900 text-gold border-gold shadow-md'
                      : 'bg-white text-navy-900 border-navy-200 hover:border-gold/50'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">Partial & Day-Of</p>
                  <p className="text-[11px] opacity-80 mt-1">
                    On-ground execution, minute-by-minute timeline & QR verifications.
                  </p>
                </button>
              </div>
            </div>

            {/* Couple Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Primary Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Rhea Kapoor"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Partner / Spouse Name
                </label>
                <div className="relative">
                  <Heart className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    placeholder="e.g. Siddharth Malhotra"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details & Preference */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="couple@domain.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Phone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Preferred Contact
                </label>
                <select
                  value={formData.preferredContactMethod}
                  onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Tentative Wedding Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                  <input
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Destination / City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Udaipur, Lake Pichola"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Guest Count & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Guest Count ({formData.guestCount} guests)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="1500"
                    step="50"
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    className="w-full accent-gold"
                  />
                  <span className="text-xs font-bold text-navy-900 min-w-12 text-right">
                    {formData.guestCount}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Budget Target
                </label>
                <select
                  value={formData.minBudget}
                  onChange={(e) => {
                    const min = Number(e.target.value);
                    setFormData({ ...formData, minBudget: min, maxBudget: min * 1.6 });
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                >
                  <option value={1500000}>INR 15 Lakh - 25 Lakh (Boutique Heritage)</option>
                  <option value={2500000}>INR 25 Lakh - 45 Lakh (Imperial Royal)</option>
                  <option value={5000000}>INR 50 Lakh - 80 Lakh (Grand Palatial Destination)</option>
                  <option value={10000000}>INR 1 Crore+ (Ultra Luxury Bespoke)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">
                Special Requests or Vision Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Mention palace preferences, themes (Mughal, Rajputana, Floral), specific rituals or dietary catering..."
                className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-darkText hover:text-navy-900"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-semibold text-sm shadow-gold-glow hover:brightness-105 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Registering Public Enquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Royal Enquiry & Get Code</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
