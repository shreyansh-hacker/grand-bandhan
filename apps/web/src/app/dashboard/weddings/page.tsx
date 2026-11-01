'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Plus,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  FileCheck,
  ChevronRight,
  X,
  Search,
  Filter,
  DollarSign,
  Eye,
  Tag,
  ShieldCheck,
  Building,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { WeddingPackageType } from '@grand-bandhan/shared';

export default function WeddingsPage() {
  const [weddings, setWeddings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  // New Wedding Form State
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    clientEmail: '',
    clientPhone: '',
    weddingDate: '',
    location: 'Udaipur, Rajasthan',
    guestCount: 350,
    budgetMin: 3500000,
    budgetMax: 5000000,
    packageType: WeddingPackageType.FULL_SERVICE,
    notes: '',
  });

  async function loadWeddings() {
    try {
      setLoading(true);
      const res = await apiRequest('/api/weddings');
      if (res.success && res.data) {
        setWeddings(res.data);
      }
    } catch (e) {
      console.error('Failed to load weddings:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeddings();
  }, []);

  async function handleCreateWedding(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await apiRequest('/api/weddings', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        alert('🎉 Royal Wedding Project created! 26+ Instant Planning tasks and digital agreement generated.');
        setIsWizardOpen(false);
        setFormData({
          brideName: '',
          groomName: '',
          clientEmail: '',
          clientPhone: '',
          weddingDate: '',
          location: 'Udaipur, Rajasthan',
          guestCount: 350,
          budgetMin: 3500000,
          budgetMax: 5000000,
          packageType: WeddingPackageType.FULL_SERVICE,
          notes: '',
        });
        loadWeddings();
      } else {
        alert(res.message || 'Failed to create wedding');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with server');
    } finally {
      setCreating(false);
    }
  }

  // Filtered weddings
  const filteredWeddings = weddings.filter((w) => {
    const matchesSearch =
      searchTerm === '' ||
      `${w.brideName} ${w.groomName} ${w.weddingCode} ${w.location}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesPackage =
      filterPackage === 'ALL' || w.packageType === filterPackage;

    const matchesStatus =
      filterStatus === 'ALL' || w.status === filterStatus;

    return matchesSearch && matchesPackage && matchesStatus;
  });

  // Aggregate stats
  const totalWeddings = weddings.length;
  const fullServiceCount = weddings.filter(
    (w) => w.packageType === WeddingPackageType.FULL_SERVICE
  ).length;
  const signedAgreementsCount = weddings.filter(
    (w) => w.agreementStatus === 'SIGNED'
  ).length;
  const totalPortfolioValue = weddings.reduce(
    (acc, w) => acc + (w.budgetMin || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <Crown className="w-4 h-4 text-gold-dark" />
            <span>Active Operations Portfolio</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            Wedding Management Directory
          </h2>
          <p className="text-xs text-darkText/70">
            Portfolio of confirmed royal weddings, instant lead-time planning milestones, and digital contracts.
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Wedding Project</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gold/30 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-darkText/60 uppercase tracking-wider">
            Total Confirmed
          </div>
          <div className="font-serif text-2xl font-bold text-navy-900 mt-1">
            {totalWeddings} Weddings
          </div>
          <div className="text-[11px] text-royal font-semibold mt-0.5">
            In active lifecycle
          </div>
        </div>

        <div className="bg-white border border-gold/30 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-darkText/60 uppercase tracking-wider">
            Full-Service Royal
          </div>
          <div className="font-serif text-2xl font-bold text-gold-dark mt-1">
            {fullServiceCount} Projects
          </div>
          <div className="text-[11px] text-darkText/60 mt-0.5">
            Comprehensive planning scope
          </div>
        </div>

        <div className="bg-white border border-gold/30 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-darkText/60 uppercase tracking-wider">
            Signed Agreements
          </div>
          <div className="font-serif text-2xl font-bold text-green-700 mt-1">
            {signedAgreementsCount} Bound
          </div>
          <div className="text-[11px] text-green-600 font-semibold mt-0.5">
            Verified digital contracts
          </div>
        </div>

        <div className="bg-white border border-gold/30 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-darkText/60 uppercase tracking-wider">
            Portfolio Value
          </div>
          <div className="font-serif text-2xl font-bold text-navy-900 mt-1">
            ₹{(totalPortfolioValue / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-royal font-semibold mt-0.5">
            Target wedding budgets
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-navy-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-darkText/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by couple name, wedding code (e.g. GB-ROYAL), or palace location..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-cream/40 border border-navy-200 rounded-xl focus:outline-none focus:border-gold"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-darkText/40 hover:text-darkText"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterPackage}
            onChange={(e) => setFilterPackage(e.target.value)}
            className="text-xs px-3 py-2 bg-cream/40 border border-navy-200 rounded-xl text-navy-900 font-semibold focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Packages</option>
            <option value={WeddingPackageType.FULL_SERVICE}>👑 Full-Service Royal</option>
            <option value={WeddingPackageType.PARTIAL_DAY_OF}>⏱️ Partial / Day-of</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-3 py-2 bg-cream/40 border border-navy-200 rounded-xl text-navy-900 font-semibold focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Operations</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-navy-200 rounded-2xl p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-navy-100 rounded-full" />
                <div className="h-5 w-32 bg-navy-100 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-navy-100 rounded" />
                <div className="h-4 w-1/2 bg-navy-50 rounded" />
              </div>
              <div className="h-16 bg-navy-50 rounded-xl" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-28 bg-navy-100 rounded" />
                <div className="h-8 w-44 bg-navy-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredWeddings.length === 0 ? (
        /* Empty State */
        <div className="bg-white border-2 border-dashed border-gold/40 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-navy-900">
              No Weddings Found
            </h3>
            <p className="text-xs text-darkText/70 mt-1 max-w-md mx-auto">
              {searchTerm || filterPackage !== 'ALL' || filterStatus !== 'ALL'
                ? 'No weddings match the current search filters. Try clearing your filters.'
                : 'No royal weddings have been registered yet. Click "New Wedding Project" to initialize your first project.'}
            </p>
          </div>
          {(searchTerm || filterPackage !== 'ALL' || filterStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterPackage('ALL');
                setFilterStatus('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-navy-900 text-gold font-bold text-xs hover:bg-navy-800 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* Weddings Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredWeddings.map((w) => (
            <div
              key={w.id}
              className="bg-white border-2 border-gold/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Header Chips */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-navy-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2.5 py-0.5 rounded-full">
                      {w.weddingCode || 'GB-WEDDING'}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        w.status === 'COMPLETED'
                          ? 'bg-navy-100 text-darkText'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {w.status || 'ACTIVE'}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      w.packageType === WeddingPackageType.FULL_SERVICE
                        ? 'bg-navy-900 text-gold'
                        : 'bg-royal/10 text-royal'
                    }`}
                  >
                    {w.packageType === WeddingPackageType.FULL_SERVICE ? 'Full-Service Royal' : 'Partial / Day-of'}
                  </span>
                </div>

                {/* Couple Names & Logistics */}
                <div className="mt-3">
                  <h3 className="font-serif text-xl font-bold text-navy-900 group-hover:text-gold-dark transition-colors">
                    {w.brideName} & {w.groomName}
                  </h3>
                  <div className="text-xs text-darkText/70 flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                      <span>{w.location}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                      <span>{w.weddingDate ? new Date(w.weddingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gold-dark" />
                      <span>{w.guestCount || 350} Guests</span>
                    </span>
                  </div>
                </div>

                {/* Progress & Milestone Inclusions */}
                <div className="mt-4 bg-cream-100 p-3.5 rounded-xl border border-navy-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-darkText/80">
                    <span className="font-medium">Instant Planning Milestones:</span>
                    <span className="font-bold text-navy-900">
                      {w.tasksCompleted || 0} / {w.tasksCount || 0} Done ({w.tasksProgress || 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-navy-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-gradient rounded-full transition-all"
                      style={{ width: `${w.tasksProgress || 0}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[11px] text-darkText/70">
                    <span className="flex items-center gap-1">
                      <span>Digital Agreement:</span>
                      <strong
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          w.agreementStatus === 'SIGNED'
                            ? 'text-green-700 bg-green-100'
                            : 'text-amber-700 bg-amber-100'
                        }`}
                      >
                        {w.agreementStatus}
                      </strong>
                    </span>
                    <span>
                      Planner: <strong className="text-navy-900">{w.plannerName}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Financials & Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-navy-100">
                <div className="text-xs">
                  <span className="text-darkText/60">Budget Base:</span>{' '}
                  <strong className="text-royal font-bold">
                    ₹{((w.budgetMin || 0) / 100000).toFixed(1)} Lakh
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDossier(w)}
                    className="px-2.5 py-1.5 rounded-lg border border-navy-200 text-navy-900 font-bold text-xs hover:bg-navy-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-royal" />
                    <span>Dossier</span>
                  </button>

                  <Link
                    href={`/dashboard/quotations?weddingId=${w.id}`}
                    className="px-3 py-1.5 rounded-lg border border-gold text-gold-dark font-bold text-xs hover:bg-gold/10 transition-colors flex items-center gap-1"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Multi-Vendor Quotes</span>
                  </Link>

                  <Link
                    href="/dashboard/tasks"
                    className="px-3 py-1.5 rounded-lg bg-navy-900 text-gold font-bold text-xs hover:bg-navy-800 transition-colors flex items-center gap-1"
                  >
                    <span>Auto Plan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wedding Project Dossier Modal */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-cream border border-gold rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-navy-gradient text-white p-6 border-b border-gold/30 relative">
              <button
                onClick={() => setSelectedDossier(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-gold hover:text-white hover:bg-navy-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider">
                <Crown className="w-4 h-4" />
                <span>Wedding Project Dossier</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-cream mt-1">
                {selectedDossier.brideName} & {selectedDossier.groomName}
              </h3>
              <p className="text-xs text-cream-300 mt-0.5">
                Project Code: <strong className="text-gold">{selectedDossier.weddingCode}</strong> | Venue: {selectedDossier.location}
              </p>
            </div>

            {/* Dossier Body */}
            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* Couple & Key Logistics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-navy-100">
                <div>
                  <div className="text-[10px] text-darkText/60 uppercase font-semibold">Ceremony Date</div>
                  <div className="font-bold text-navy-900 text-sm mt-0.5">
                    {selectedDossier.weddingDate
                      ? new Date(selectedDossier.weddingDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Date Tentative'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-darkText/60 uppercase font-semibold">Guaranteed Guests</div>
                  <div className="font-bold text-navy-900 text-sm mt-0.5">
                    {selectedDossier.guestCount || 350} Guests
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-darkText/60 uppercase font-semibold">Service Package</div>
                  <div className="font-bold text-gold-dark text-sm mt-0.5">
                    {selectedDossier.packageType === WeddingPackageType.FULL_SERVICE
                      ? '👑 Full-Service Royal'
                      : '⏱️ Partial / Day-of'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-darkText/60 uppercase font-semibold">Client Email</div>
                  <div className="font-semibold text-navy-900 mt-0.5 truncate">
                    {selectedDossier.clientEmail || 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-darkText/60 uppercase font-semibold">Client Phone</div>
                  <div className="font-semibold text-navy-900 mt-0.5">
                    {selectedDossier.clientPhone || 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-darkText/60 uppercase font-semibold">Assigned Planner</div>
                  <div className="font-semibold text-navy-900 mt-0.5">
                    {selectedDossier.plannerName || 'Grand Bandhan Executive'}
                  </div>
                </div>
              </div>

              {/* Digital Agreement & Legal Status */}
              <div className="bg-white p-4 rounded-xl border border-gold/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-serif font-bold text-sm text-navy-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-gold-dark" />
                    <span>Wedding Planning & Management Service Agreement</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedDossier.agreementStatus === 'SIGNED'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {selectedDossier.agreementStatus}
                  </span>
                </div>

                <p className="text-darkText/70 leading-relaxed text-[11px]">
                  Binding formal service agreement signed digitally under Indian contract regulations. Covers package scope, 26+ deliverables, and cancellation terms.
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-navy-100">
                  <span className="text-darkText/60 text-[11px]">
                    Signed By: <strong>{selectedDossier.agreement?.signedByName || selectedDossier.brideName || 'Client'}</strong>
                  </span>
                  <Link
                    href="/dashboard/agreements"
                    className="text-royal font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Manage Agreements</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="bg-white p-4 rounded-xl border border-navy-100 space-y-3">
                <div className="font-serif font-bold text-sm text-navy-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-gold-dark" />
                  <span>Financial & Milestone Ledger</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-cream-50 rounded-lg border border-navy-100">
                    <div className="text-[10px] text-darkText/60 uppercase">Target Budget</div>
                    <div className="font-serif text-base font-bold text-navy-900 mt-0.5">
                      ₹{((selectedDossier.budgetMin || 0) / 100000).toFixed(1)}L
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 uppercase font-semibold">Collected</div>
                    <div className="font-serif text-base font-bold text-emerald-900 mt-0.5">
                      ₹{((selectedDossier.totalPaid || 0) / 100000).toFixed(1)}L
                    </div>
                  </div>

                  <div className="p-2.5 bg-navy-50 rounded-lg border border-navy-200">
                    <div className="text-[10px] text-navy-800 uppercase font-semibold">Auto Milestones</div>
                    <div className="font-serif text-base font-bold text-navy-900 mt-0.5">
                      {selectedDossier.tasksProgress || 0}% Complete
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="space-y-2">
                <div className="font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                  Project Operational Modules
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/dashboard/quotations?weddingId=${selectedDossier.id}`}
                    className="p-3 rounded-xl border border-gold/40 bg-white hover:bg-gold/10 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gold-dark" />
                      <div>
                        <div className="font-bold text-navy-900">Multi-Vendor Quotations</div>
                        <div className="text-[10px] text-darkText/60">Compare vendor bids</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gold-dark" />
                  </Link>

                  <Link
                    href="/dashboard/tasks"
                    className="p-3 rounded-xl border border-gold/40 bg-white hover:bg-gold/10 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="font-bold text-navy-900">Instant Task Planner</div>
                        <div className="text-[10px] text-darkText/60">Kanban milestone board</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-700" />
                  </Link>

                  <Link
                    href="/dashboard/events"
                    className="p-3 rounded-xl border border-gold/40 bg-white hover:bg-gold/10 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-royal" />
                      <div>
                        <div className="font-bold text-navy-900">Live Day-of Timeline</div>
                        <div className="text-[10px] text-darkText/60">Ceremony run sheet</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-royal" />
                  </Link>

                  <Link
                    href="/dashboard/verification"
                    className="p-3 rounded-xl border border-gold/40 bg-white hover:bg-gold/10 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-navy-900" />
                      <div>
                        <div className="font-bold text-navy-900">Service Verification</div>
                        <div className="text-[10px] text-darkText/60">GPS radar & checks</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-navy-900" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-navy-50 border-t border-navy-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedDossier(null)}
                className="px-5 py-2 rounded-xl bg-navy-900 text-gold font-bold text-xs hover:bg-navy-800 transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Wedding Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-cream border border-gold rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-navy-gradient text-white p-6 border-b border-gold/30 relative">
              <button
                onClick={() => setIsWizardOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-gold hover:text-white hover:bg-navy-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-serif text-2xl font-bold text-cream">Initialize New Wedding Project</h3>
              <p className="text-xs text-cream-300 mt-1">
                Creates project with digital agreement, milestones, and 26+ automated lead-time tasks.
              </p>
            </div>

            <form onSubmit={handleCreateWedding} className="p-6 space-y-4 text-xs">
              {/* Package Selector */}
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-2">
                  Select Operations Package
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, packageType: WeddingPackageType.FULL_SERVICE })}
                    className={`p-3 rounded-xl border text-left font-semibold cursor-pointer ${
                      formData.packageType === WeddingPackageType.FULL_SERVICE
                        ? 'bg-navy-900 text-gold border-gold'
                        : 'bg-white text-navy-900 border-navy-200'
                    }`}
                  >
                    👑 Full-Service Royal
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, packageType: WeddingPackageType.PARTIAL_DAY_OF })}
                    className={`p-3 rounded-xl border text-left font-semibold cursor-pointer ${
                      formData.packageType === WeddingPackageType.PARTIAL_DAY_OF
                        ? 'bg-navy-900 text-gold border-gold'
                        : 'bg-white text-navy-900 border-navy-200'
                    }`}
                  >
                    ⏱️ Partial / Day-of
                  </button>
                </div>
              </div>

              {/* Couple Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">Bride Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brideName}
                    onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                    placeholder="e.g. Rhea Kapoor"
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-darkText mb-1">Groom Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.groomName}
                    onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                    placeholder="e.g. Siddharth Malhotra"
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">Client Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="couple@domain.com"
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-darkText mb-1">Client Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">Wedding Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.weddingDate}
                    onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-darkText mb-1">Location / Palace *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Jagmandir Island Palace, Udaipur"
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Guest & Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">Guest Count</label>
                  <input
                    type="number"
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-darkText mb-1">Budget Target (INR)</label>
                  <input
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-4 py-2 font-medium text-darkText cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 disabled:opacity-50 cursor-pointer"
                >
                  {creating ? 'Generating 26+ Tasks...' : 'Create Wedding & Auto-Generate Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
