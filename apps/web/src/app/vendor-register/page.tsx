'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Building,
  Mail,
  Phone,
  MapPin,
  Tag,
  DollarSign,
  Globe,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

const VENDOR_CATEGORIES = [
  { value: 'VENUE', label: 'Palace, Heritage Fort & Luxury Venue' },
  { value: 'CATERING', label: 'Royal Catering & Imperial Dining' },
  { value: 'DECORATION', label: 'Palace Mandap & Floral Decor' },
  { value: 'PHOTOGRAPHY', label: 'Cinematography & Fine-Art Photography' },
  { value: 'DJ_MUSIC', label: 'Sangeet DJ, Symphony & Live Artists' },
  { value: 'MAKEUP_ARTIST', label: 'Bridal Couture Styling & Makeup' },
  { value: 'FLORIST', label: 'Exotic Floral & Stage Architecture' },
  { value: 'TRANSPORTATION', label: 'Vintage Car Fleet & Guest Logistics' },
  { value: 'CHOREOGRAPHY', label: 'Sangeet Choreography & Show Directors' },
  { value: 'MEHENDI_ARTIST', label: 'Heritage Mehendi Artisans' },
  { value: 'OTHER', label: 'Specialized Royal Wedding Services' },
];

export default function VendorRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    category: 'DECORATION',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    pricingModel: 'PER_EVENT',
    basePrice: '',
    portfolioUrl: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        contactPerson: formData.contactPerson.trim() || formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        pricingModel: formData.pricingModel,
        basePrice: Number(formData.basePrice) || 0,
        portfolioUrls: formData.portfolioUrl.trim() ? [formData.portfolioUrl.trim()] : [],
        notes: formData.notes.trim(),
      };

      const res = await apiRequest('/api/vendors/public-apply', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        setSuccess(res.data);
      } else {
        setError(res.message || 'Unable to submit application. Please check your information.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please check connection to server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-royal/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-3 relative z-10">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-gold-dark" />
            <span className="font-serif text-2xl font-bold tracking-widest text-gold-gradient">
              GRAND BANDHAN
            </span>
          </div>
        </Link>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-cream">
          Join the Royal Vendor Ecosystem
        </h2>
        <p className="text-xs sm:text-sm text-gold-light/90 max-w-lg mx-auto font-medium leading-relaxed">
          Partner with India&apos;s definitive luxury wedding platform. Gain access to transparent palace wedding RFPs, guaranteed milestone payouts, and digital operations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-cream border border-gold/40 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {success ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 mx-auto bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center text-green-700 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-navy-950">
                  Application Submitted for Royal Verification
                </h3>
                <p className="text-sm text-darkText/80 max-w-md mx-auto">
                  Thank you, <strong>{success.name}</strong>. Your vendor application has been recorded in our master registry and dispatched to{' '}
                  <strong className="text-royal">Super Admin Shreyansh Sharma</strong> for review.
                </p>
              </div>

              <div className="p-4 bg-navy-950/5 border border-gold/40 rounded-xl max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-darkText/60">Registered Vendor:</span>
                  <strong className="text-navy-900">{success.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-darkText/60">Category:</span>
                  <strong className="text-gold-dark">{success.category}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-darkText/60">Contact Email:</span>
                  <strong className="font-mono text-navy-900">{success.email}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-darkText/60">Verification Status:</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px]">
                    PENDING SUPER ADMIN APPROVAL
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all text-center"
                >
                  Return to Homepage
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-navy-300 text-navy-900 hover:bg-navy-100 font-semibold text-xs transition-colors text-center"
                >
                  Go to Command Portal
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-xs bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-darkText mb-1">
                    Business / Brand Name *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Royal Rajputana Florals"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-darkText mb-1">
                    Vendor Category *
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                    >
                      {VENDOR_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-darkText mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Yash Sharma"
                    className="w-full px-3 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-darkText mb-1">
                    Official Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. partner@luxuryweddings.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-darkText mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98290 12345"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-darkText mb-1">
                    Operating City / State *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Udaipur, Rajasthan"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-darkText mb-1">
                    Base Starting Package (INR ₹)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="e.g. 150000"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-darkText mb-1">
                    Portfolio / Website / Instagram Link
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                    <input
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      placeholder="https://instagram.com/yourhandle"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Experience &amp; Heritage Weddings Overview
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Describe past palace wedding experience, team capacity, and signature styles..."
                  className="w-full px-3 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-navy-950" />
                      <span>Submitting Royal Vendor Application...</span>
                    </div>
                  ) : (
                    <>
                      <span>Submit Application for Royal Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-darkText/70 pt-2 border-t border-navy-200/80">
                Already an onboarded partner?{' '}
                <Link href="/login" className="font-semibold text-royal hover:underline">
                  Sign In to Vendor Portal
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
