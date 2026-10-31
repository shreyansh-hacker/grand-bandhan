'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  MapPin,
  Globe,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    agencyName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    website: '',
    gstin: '',
    businessDescription: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredData, setRegisteredData] = useState<{
    agencyName: string;
    email: string;
    status: string;
  } | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/api/agencies/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setRegisteredData({
          agencyName: formData.agencyName,
          email: formData.email,
          status: res.status || 'PENDING_APPROVAL',
        });
      } else {
        setError(res.message || 'Registration failed. Please check your inputs.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-royal/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-3 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <Crown className="w-6 h-6 text-gold" />
            </div>
          </div>
        </Link>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-cream">
          Register Imperial Wedding Agency
        </h2>
        <p className="text-xs uppercase tracking-widest text-gold-light/80 font-medium">
          Multi-Tenant Agency Onboarding & Operations On-Ramp
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-cream border border-gold/40 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {registeredData ? (
            <div className="text-center space-y-6 py-6">
              <div className="w-20 h-20 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center mx-auto border-2 border-gold shadow-gold-glow">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  Status: {registeredData.status}
                </span>
                <h3 className="font-serif text-2xl font-bold text-navy-950">
                  Application Submitted Under Imperial Review
                </h3>
                <p className="text-sm text-darkText/80 max-w-lg mx-auto">
                  Thank you for registering <strong>{registeredData.agencyName}</strong>. Your agency account is now
                  persisted in the Grand Bandhan registry.
                </p>
              </div>

              <div className="p-4 bg-navy-900 text-cream rounded-xl text-left text-xs space-y-2 border border-gold/30">
                <div className="flex items-center gap-2 text-gold font-bold uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-4 h-4" />
                  <span>Next Steps in Agency Approval Lifecycle</span>
                </div>
                <p className="text-cream-300 leading-relaxed">
                  1. A notification has been dispatched to <strong>{registeredData.email}</strong> via Resend transactional outbox.
                </p>
                <p className="text-cream-300 leading-relaxed">
                  2. Grand Bandhan Super Admin team validates luxury vendor standards and regulatory criteria before activating your dashboard.
                </p>
                <p className="text-cream-300 leading-relaxed">
                  3. Once approved, you will receive your activation email and instant access to the command center.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  href="/login"
                  className="py-2.5 px-6 rounded-lg bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all text-center"
                >
                  Return to Portal Sign In
                </Link>
                <Link
                  href="/"
                  className="py-2.5 px-6 rounded-lg bg-navy-100 text-navy-950 font-bold text-sm hover:bg-navy-200 transition-colors text-center"
                >
                  Explore Public Website
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="p-3 text-xs bg-red-100 border border-red-300 text-red-800 rounded-lg">
                  {error}
                </div>
              )}

              {/* Agency Basics */}
              <div>
                <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-3 pb-1 border-b border-navy-200">
                  1. Agency Profile & Legal Entity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-darkText mb-1">
                      Agency Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.agencyName}
                        onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                        placeholder="e.g. Rajputana Royal Weddings"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-darkText mb-1">
                      Owner / Managing Director <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="e.g. Vikramaditya Rathore"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div>
                <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-3 pb-1 border-b border-navy-200">
                  2. Business Contact & Registered Office
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-darkText mb-1">
                      Official Work Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="admin@rajputanaweddings.com"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-darkText mb-1">
                      Contact Phone <span className="text-red-500">*</span>
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

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-darkText mb-1">
                      Office Street Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Suite 401, Heritage Towers, Lake Palace Road"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-darkText mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Udaipur"
                      className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-darkText mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. Rajasthan"
                      className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-darkText mb-1">Website URL (Optional)</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://rajputanaweddings.com"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-darkText mb-1">GSTIN / Tax ID (Optional)</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                        placeholder="08AAAAA0000A1Z5"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Credentials */}
              <div>
                <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-3 pb-1 border-b border-navy-200">
                  3. Security Credentials (Admin Login)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-darkText mb-1">
                      Master Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="At least 8 characters"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-darkText mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Repeat master password"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">
                  Brief Portfolio / Weddings Executed (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  placeholder="Tell us about the scale, heritage palaces, and average guest sizes your agency manages..."
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Submitting Application to Grand Bandhan Registry...</span>
                ) : (
                  <>
                    <span>Submit Agency Onboarding Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-darkText/70 pt-2">
                Already registered your agency?{' '}
                <Link href="/login" className="font-semibold text-royal hover:underline">
                  Sign In to Portal
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
