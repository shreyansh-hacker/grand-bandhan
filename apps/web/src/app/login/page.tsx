'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Crown, Lock, Mail, ArrowRight, Sparkles, Shield, UserCheck } from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(userEmail = email, userPass = password) {
    setLoading(true);
    setError('');

    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: userEmail, password: userPass }),
      });

      if (res.success && res.data) {
        setAuthToken(res.data.accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('gb_user', JSON.stringify(res.data.user));
        }

        // Redirect based on role
        if (res.data.user.role === 'CLIENT') {
          router.push('/dashboard/weddings');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  // Quick 1-Click Demo Login Helper
  function quickLogin(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('GrandBandhan@2025');
    handleLogin(demoEmail, 'GrandBandhan@2025');
  }

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-royal/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
              <Crown className="w-6 h-6 text-gold" />
            </div>
          </div>
        </Link>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-cream">
          Grand Bandhan Command Portal
        </h2>
        <p className="text-xs uppercase tracking-widest text-gold-light/80 font-medium">
          Sign In to Access Wedding Operations & Live Timeline
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-cream border border-gold/40 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 text-xs bg-red-100 border border-red-300 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gold-dark absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@grandbandhan.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Switcher for Hackathon Judges */}
          <div className="pt-4 border-t border-navy-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
              <span>1-Click Hackathon Role Evaluator:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickLogin('admin@grandbandhan.com')}
                className="py-1.5 px-2 bg-navy-900 text-gold rounded border border-gold/40 hover:bg-navy-800 text-left font-medium"
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('planner@grandbandhan.com')}
                className="py-1.5 px-2 bg-navy-900 text-gold rounded border border-gold/40 hover:bg-navy-800 text-left font-medium"
              >
                📋 Wedding Planner
              </button>
              <button
                type="button"
                onClick={() => quickLogin('coordinator@grandbandhan.com')}
                className="py-1.5 px-2 bg-navy-900 text-gold rounded border border-gold/40 hover:bg-navy-800 text-left font-medium"
              >
                📍 On-ground Staff
              </button>
              <button
                type="button"
                onClick={() => quickLogin('client@grandbandhan.com')}
                className="py-1.5 px-2 bg-navy-900 text-gold rounded border border-gold/40 hover:bg-navy-800 text-left font-medium"
              >
                💍 Couple / Client
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-darkText/70">
            Need an agency account?{' '}
            <Link href="/register" className="font-semibold text-royal hover:underline">
              Register New Agency
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
