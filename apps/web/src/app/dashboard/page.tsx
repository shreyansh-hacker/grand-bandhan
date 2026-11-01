'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Users,
  CheckSquare,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
  AlertCircle,
  Plus,
  Radio,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { motion } from 'framer-motion';

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await apiRequest('/api/analytics/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const metrics = data?.metrics || {
    totalWeddings: 1,
    activeWeddings: 1,
    upcomingWeddings: 1,
    completedWeddings: 0,
    totalEnquiries: 3,
    brideSideEnquiries: 1,
    groomSideEnquiries: 1,
    pendingTasks: 21,
    delayedTasks: 0,
    vendorCount: 6,
    onTimeArrivalRate: 100,
    totalRevenue: 875000,
    totalExpenses: 750000,
    netGrossProfit: 125000,
    upcomingClientPayments: 2625000,
    pendingVendorPayments: 750000,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-gradient text-white p-6 sm:p-8 rounded-2xl border border-gold/40 shadow-navy-deep"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-wider">
            <Crown className="w-4 h-4" />
            <span>Executive Operations Control</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cream">
            Imperial Wedding Command Center
          </h2>
          <p className="text-xs sm:text-sm text-cream-300">
            Real-time multi-tenant monitoring of royal wedding portfolios, RFPs, and wedding-day service execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/quotations"
            className="px-4 py-2 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Quotation Matrix</span>
          </Link>

          <Link
            href="/dashboard/events"
            className="px-4 py-2 rounded-xl border border-gold/40 text-gold hover:bg-gold/10 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-4 h-4 text-green-400" />
            <span>Live Timeline Radar</span>
          </Link>
        </div>
      </motion.div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total & Active Weddings */}
        <div className="bg-white border border-gold/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-darkText/70">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Portfolio</span>
            <div className="w-8 h-8 rounded-lg bg-navy-50 text-royal flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-navy-900">
              {metrics.activeWeddings} / {metrics.totalWeddings}
            </div>
            <p className="text-xs text-darkText/60 mt-0.5">
              {metrics.upcomingWeddings} upcoming destination weddings
            </p>
          </div>
          <div className="text-[11px] text-royal font-semibold pt-1 border-t border-navy-100 flex items-center justify-between">
            <span>Verified Portfolio</span>
            <Link href="/dashboard/weddings" className="hover:underline">View All &rarr;</Link>
          </div>
        </div>

        {/* Financial Revenue & Profit */}
        <div className="bg-white border border-gold/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-darkText/70">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Operating Profit</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-green-700">
              ₹{metrics.netGrossProfit.toLocaleString()}
            </div>
            <p className="text-xs text-darkText/60 mt-0.5">
              Revenue: ₹{metrics.totalRevenue.toLocaleString()} | Exp: ₹{metrics.totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="text-[11px] text-darkText/70 pt-1 border-t border-navy-100 flex items-center justify-between">
            <span>Pending Due: ₹{metrics.upcomingClientPayments.toLocaleString()}</span>
            <Link href="/dashboard/payments" className="text-royal font-semibold hover:underline">Ledger &rarr;</Link>
          </div>
        </div>

        {/* Instant Tasks Pipeline */}
        <div className="bg-white border border-gold/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-darkText/70">
            <span className="text-xs font-semibold uppercase tracking-wider">Auto-Tasks Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 text-gold-dark flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-navy-900">
              {metrics.pendingTasks} Pending
            </div>
            <p className="text-xs text-darkText/60 mt-0.5">
              {metrics.delayedTasks === 0 ? '✓ Zero delayed milestones' : `${metrics.delayedTasks} tasks need escalation`}
            </p>
          </div>
          <div className="text-[11px] text-gold-dark font-semibold pt-1 border-t border-navy-100 flex items-center justify-between">
            <span>25+ Auto Lead-times</span>
            <Link href="/dashboard/tasks" className="hover:underline">Task Board &rarr;</Link>
          </div>
        </div>

        {/* Vendor Arrival Radar */}
        <div className="bg-white border border-gold/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-darkText/70">
            <span className="text-xs font-semibold uppercase tracking-wider">Vendor Arrival Radar</span>
            <div className="w-8 h-8 rounded-lg bg-royal/10 text-royal flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-navy-900">
              {metrics.onTimeArrivalRate}% On-Time
            </div>
            <p className="text-xs text-darkText/60 mt-0.5">
              {metrics.delayedArrivals} logged gate delays
            </p>
          </div>
          <div className="text-[11px] text-royal font-semibold pt-1 border-t border-navy-100 flex items-center justify-between">
            <span>Live Gate Tracking</span>
            <Link href="/dashboard/events" className="hover:underline">Monitor &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Flagship Wedding Spotlight */}
      <div className="bg-white border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-navy-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2.5 py-0.5 rounded-full inline-block">
              Flagship Destination Showcase
            </span>
            <h3 className="font-serif text-2xl font-bold text-navy-900 mt-1">
              Rhea Kapoor & Siddharth Malhotra – Royal Palace Wedding
            </h3>
            <p className="text-xs text-darkText/70">
              Jagmandir Island Palace, Lake Pichola, Udaipur • 400 Guests • Full-Service Package
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/weddings"
              className="px-4 py-2 rounded-lg bg-navy-900 text-gold font-bold text-xs hover:bg-navy-800 transition-colors"
            >
              Open Wedding Workspace &rarr;
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-navy-50 p-4 rounded-xl border border-navy-200/80 space-y-2">
            <div className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
              Multi-Vendor Quotations Status
            </div>
            <p className="text-darkText/80">
              400-guest Royal Catering RFP active with competitive bids. Royal Rajputana recommended at <strong>₹1,850/plate</strong>.
            </p>
            <Link href="/dashboard/quotations" className="text-royal font-bold inline-block hover:underline">
              Compare Multi-Vendor Quotes &rarr;
            </Link>
          </div>

          <div className="bg-navy-50 p-4 rounded-xl border border-navy-200/80 space-y-2">
            <div className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
              Instant Task Generation
            </div>
            <p className="text-darkText/80">
              26 bespoke lead-time tasks generated automatically. 3 completed, 2 in progress with shadow coordinators.
            </p>
            <Link href="/dashboard/tasks" className="text-royal font-bold inline-block hover:underline">
              Open Kanban Board &rarr;
            </Link>
          </div>

          <div className="bg-navy-50 p-4 rounded-xl border border-navy-200/80 space-y-2">
            <div className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
              Service Verification Alert
            </div>
            <p className="text-darkText/80">
              DJ Shadow scheduled at 7:00 PM. Automated verification trigger primed for Client & Coordinator sign-off.
            </p>
            <Link href="/dashboard/verification" className="text-royal font-bold inline-block hover:underline">
              Check Escrow Status &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* CRM Lead Pipeline Snapshot (Bride Side vs Groom Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gold/30 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-lg font-bold text-navy-900">
              Customer Enquiry Pipeline
            </h4>
            <Link href="/dashboard/enquiries" className="text-xs text-royal font-semibold hover:underline">
              View All Enquiries &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-pink-50 border border-pink-200">
              <span className="font-bold text-pink-900">Bride Side Enquiries</span>
              <div className="text-2xl font-serif font-bold text-pink-900 mt-1">
                {metrics.brideSideEnquiries}
              </div>
              <span className="text-[10px] text-pink-700">Specific Mehndi & Decor Focus</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="font-bold text-blue-900">Groom Side Enquiries</span>
              <div className="text-2xl font-serif font-bold text-blue-900 mt-1">
                {metrics.groomSideEnquiries}
              </div>
              <span className="text-[10px] text-blue-700">Baraat & Vintage Fleets Focus</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white border border-gold/30 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="font-serif text-lg font-bold text-navy-900">
            Quick Operations Shortcuts
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              href="/dashboard/quotations"
              className="p-3 rounded-xl border border-gold/40 bg-cream text-navy-900 hover:bg-gold/10 transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-gold" />
              <span>Multi-Vendor RFP Matrix</span>
            </Link>

            <Link
              href="/dashboard/tasks"
              className="p-3 rounded-xl border border-gold/40 bg-cream text-navy-900 hover:bg-gold/10 transition-colors flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4 text-gold" />
              <span>Regenerate Auto Plan</span>
            </Link>

            <Link
              href="/dashboard/events"
              className="p-3 rounded-xl border border-gold/40 bg-cream text-navy-900 hover:bg-gold/10 transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-gold" />
              <span>Check Gate Arrivals</span>
            </Link>

            <Link
              href="/dashboard/verification"
              className="p-3 rounded-xl border border-gold/40 bg-cream text-navy-900 hover:bg-gold/10 transition-colors flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-gold" />
              <span>Service Escrow Verify</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
