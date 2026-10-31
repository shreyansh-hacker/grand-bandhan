'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Crown, Lock, Mail, User, Phone, Building2, ArrowRight } from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    agencyName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success && res.data) {
        setAuthToken(res.data.accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('gb_user', JSON.stringify(res.data.user));
        }
        router.push('/dashboard');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-gold" />
            </div>
          </div>
        </Link>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-cream">
          Register Imperial Wedding Agency
        </h2>
        <p className="text-xs uppercase tracking-widest text-gold-light/80 font-medium">
          Create Agency Admin Account & Operations Workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-cream border border-gold/40 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-red-100 border border-red-300 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">Agency Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  placeholder="e.g. Royal Rajputana Weddings"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">Admin Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Rathore"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@agency.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">Contact Phone</label>
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
              <label className="block text-xs font-semibold text-darkText mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Registering Agency...</span>
              ) : (
                <>
                  <span>Create Agency & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-darkText/70">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-royal hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
