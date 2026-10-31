'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Bell, Radio, ExternalLink, Plus, Sparkles } from 'lucide-react';
import { NeonStatusBadge } from '../features/neon/NeonStatusBadge';

export default function DashboardNavbar() {
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gb_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  return (
    <header className="h-20 bg-white border-b border-navy-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
          Operations Command Center
        </h1>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Socket.IO Live Radar</span>
        </div>
        <div className="hidden lg:block">
          <NeonStatusBadge />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1 text-xs font-semibold text-royal hover:text-navy-900"
        >
          <span>Public Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* User Role Pill */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2.5 bg-navy-50 border border-navy-200 px-3 py-1.5 rounded-xl hover:border-gold/60 hover:bg-gold/5 transition-all"
          title="Account Settings & Profile"
        >
          <div className="w-7 h-7 rounded-full bg-gold-gradient text-navy-950 flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-navy-900 leading-tight">
              {user?.name || 'Authorized Official'}
            </span>
            <span className="text-[10px] text-gold-dark font-semibold uppercase tracking-wider">
              {user?.role || 'AGENCY_ADMIN'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
