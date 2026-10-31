'use client';

import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, User, Phone, Mail, MapPin, Users, Heart } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { EnquirySource, PlanningForSide } from '@grand-bandhan/shared';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnquiryModal({ isOpen, onClose }: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    weddingDate: '',
    location: 'Udaipur, Rajasthan',
    guestCount: 350,
    theme: 'Royal Rajputana Heritage & Gold',
    minBudget: 2500000,
    maxBudget: 4500000,
    source: EnquirySource.WEBSITE,
    planningFor: PlanningForSide.NOT_SPECIFIED,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await apiRequest('/api/enquiries', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.message || 'Failed to submit enquiry');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-cream border border-gold rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Banner */}
        <div className="bg-navy-gradient text-white p-6 border-b border-gold/30 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-gold hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-gold text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Royal Wedding Concierge</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-cream">Plan Your Imperial Celebration</h3>
          <p className="text-xs text-cream-300 mt-1">
            Share your envisioned wedding parameters. Our senior planners will prepare a bespoke proposal.
          </p>
        </div>

        {/* Content Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gold/20 text-gold rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-navy-900">Enquiry Received with Royal Honour</h4>
            <p className="text-sm text-darkText/80 max-w-md mx-auto">
              Thank you, <strong>{formData.customerName}</strong>. Your enquiry has been routed directly to our Udaipur lead concierge desk. We will reach out within 4 business hours.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-lg bg-navy-900 text-gold font-semibold text-sm hover:bg-navy-800 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 text-xs bg-red-100 border border-red-300 text-red-800 rounded-lg">
                {errorMessage}
              </div>
            )}

            {/* Optional Skippable Field: Wedding Planning For (Bride / Groom side) */}
            <div className="bg-navy-50 border border-gold/30 p-3.5 rounded-xl">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                Wedding Planning For: <span className="text-gold-dark font-normal normal-case">(Optional / Skippable)</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: PlanningForSide.BRIDE_SIDE, label: 'Bride Side 👰' },
                  { id: PlanningForSide.GROOM_SIDE, label: 'Groom Side 🤵' },
                  { id: PlanningForSide.NOT_SPECIFIED, label: 'Skip / Joint 👑' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, planningFor: item.id })}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      formData.planningFor === item.id
                        ? 'bg-navy-900 text-gold border-gold shadow-sm'
                        : 'bg-white text-navy-800 border-navy-200 hover:border-gold/60'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Names & Contact */}
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
                    placeholder="e.g. Siddharth Malhotra & Rhea Kapoor"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Contact Phone / WhatsApp <span className="text-red-500">*</span>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Tentative Wedding Date
                </label>
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Location & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Destination / Location <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Estimated Guest Count ({formData.guestCount} guests)
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
                  <span className="text-xs font-bold text-navy-900 min-w-12 text-right">{formData.guestCount}</span>
                </div>
              </div>
            </div>

            {/* Budget Range & Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Envisioned Wedding Theme
                </label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="e.g. Palace Heritage, Royal Mughal, Contemporary Chic"
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Budget Target (INR {formData.minBudget.toLocaleString()} - {formData.maxBudget.toLocaleString()})
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

            {/* Multi-channel Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  How did you discover Grand Bandhan?
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as EnquirySource })}
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                >
                  <option value={EnquirySource.WEBSITE}>Grand Bandhan Website</option>
                  <option value={EnquirySource.INSTAGRAM}>Instagram Showcase</option>
                  <option value={EnquirySource.WHATSAPP}>WhatsApp Concierge</option>
                  <option value={EnquirySource.PHONE}>Phone Call / Referral</option>
                  <option value={EnquirySource.MANUAL}>In-person Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Special Wishes or Specific Requests
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Need lake boat Baraat, organic pure vegetarian catering..."
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Submit CTA */}
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
                  <span>Submitting Enquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Royal Enquiry</span>
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
