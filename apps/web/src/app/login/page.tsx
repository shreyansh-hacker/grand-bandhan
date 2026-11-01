'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Crown, Lock, Mail, ArrowRight, Loader2, AlertTriangle, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { apiRequest, setAuthToken } from '@/lib/api';

const QUICK_ACCOUNTS = [
  {
    roleLabel: 'Super Admin',
    name: 'Shreyansh Sharma',
    email: 'shreyanshsharma049@gmail.com',
    password: 'Password@123',
    icon: '👑',
    badgeColor: 'border-amber-400 bg-amber-500/10 text-amber-900',
    description: 'Platform Master & Multi-Agency Governance',
  },
  {
    roleLabel: 'Agency Admin',
    name: 'Yash Rathore',
    email: 'yashrathore2574@gmail.com',
    password: 'Password@123',
    icon: '🏛️',
    badgeColor: 'border-blue-400 bg-blue-500/10 text-blue-900',
    description: 'Agency Operations & Financial Control',
  },
  {
    roleLabel: 'Lead Planner',
    name: 'Yash Audichya',
    email: 'yashaudichya001@gmail.com',
    password: 'Password@123',
    icon: '📋',
    badgeColor: 'border-purple-400 bg-purple-500/10 text-purple-900',
    description: 'Wedding Coordination & Day-of Operations',
  },
  {
    roleLabel: 'Royal Client',
    name: 'Demo Couple',
    email: 'client@grandbandhan.com',
    password: 'Password@123',
    icon: '💍',
    badgeColor: 'border-emerald-400 bg-emerald-500/10 text-emerald-900',
    description: 'Wedding Checklist, Invoices & Itinerary',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggingInAs, setLoggingInAs] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [agencyPending, setAgencyPending] = useState<string | null>(null);

  async function handleLogin(userEmail = email, userPass = password, roleTag?: string) {
    setLoading(true);
    if (roleTag) setLoggingInAs(roleTag);
    setError('');
    setAgencyPending(null);

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
        if (res.status === 'PENDING_APPROVAL') {
          setAgencyPending(
            res.message ||
              'Your agency registration is currently under Super Admin verification. You will be notified via email once approved.'
          );
        } else {
          setError(res.message || 'Invalid credentials. Please verify your email and password.');
        }
      }
    } catch (err: any) {
      if (err.status === 403 && err.message?.toLowerCase().includes('pending')) {
        setAgencyPending(err.message);
      } else {
        setError(err.message || 'Authentication failed. Please verify connection to the server.');
      }
    } finally {
      setLoading(false);
      setLoggingInAs(null);
    }
  }

  function handleOneClickLogin(acc: typeof QUICK_ACCOUNTS[0]) {
    setEmail(acc.email);
    setPassword(acc.password);
    handleLogin(acc.email, acc.password, acc.roleLabel);
  }

  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-royal/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-gold-dark" />
            <span className="font-serif text-2xl font-bold tracking-widest text-gold-gradient">
              GRAND BANDHAN
            </span>
          </div>
        </Link>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-cream">
          Grand Bandhan Command Portal
        </h2>
        <p className="text-xs uppercase tracking-widest text-gold-light/80 font-medium">
          Sign In to Access Wedding Operations & Live Timeline
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4 sm:px-0">
        <div className="bg-cream border border-gold/40 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {/* Quick 1-Click Demo Login Bar */}
          <div className="p-4 bg-navy-950/5 rounded-xl border border-gold/40 shadow-inner">
            <div className="flex items-center justify-between gap-1.5 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                
                <span className="uppercase tracking-wider">⚡ 1-Click Instant Login</span>
              </div>
              <span className="text-[10px] text-darkText/60 font-medium">
                Click any role to log in immediately
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {QUICK_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleOneClickLogin(acc)}
                  className="p-2.5 rounded-lg border border-gold/40 bg-white hover:bg-gold/10 hover:border-gold active:scale-95 transition-all text-left group shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-950 group-hover:text-royal flex items-center gap-1">
                      <span>{acc.icon}</span>
                      <span>{acc.roleLabel}</span>
                    </span>
                    <span className="text-[10px] text-royal font-semibold group-hover:underline">
                      {loggingInAs === acc.roleLabel ? (
                        <span className="flex items-center gap-1 text-gold-dark">
                          <Loader2 className="w-3 h-3 animate-spin text-gold-dark" />
                          Signing In...
                        </span>
                      ) : (
                        'Login →'
                      )}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-darkText/80 font-medium truncate">
                    {acc.name}
                  </div>
                  <div className="text-[10px] text-darkText/50 truncate font-mono">
                    {acc.email}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-navy-200"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-darkText/50 uppercase tracking-widest">
              Or Sign In Manually
            </span>
            <div className="flex-grow border-t border-navy-200"></div>
          </div>

          {agencyPending && (
            <div className="p-3 text-xs bg-amber-50 border border-amber-300 text-amber-900 rounded-lg flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Application Pending Super Admin Approval</p>
                <p className="mt-0.5">{agencyPending}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 text-xs bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0" />
              <span>{error}</span>
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
                  placeholder="shreyanshsharma049@gmail.com"
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
              {loading && !loggingInAs ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
                  <span>Authenticating Royal Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-darkText/70 pt-2 border-t border-navy-200/80">
            <div>
              Need to register an agency?{' '}
              <Link href="/register" className="font-semibold text-royal hover:underline">
                Register Agency
              </Link>
            </div>
            <div>
              <Link href="/vendor-register" className="font-semibold text-amber-700 hover:underline">
                Join as Vendor →
              </Link>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
