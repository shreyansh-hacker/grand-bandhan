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
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { WeddingPackageType } from '@grand-bandhan/shared';

export default function WeddingsPage() {
  const [weddings, setWeddings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
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
      const res = await apiRequest('/api/weddings');
      if (res.success && res.data) {
        setWeddings(res.data);
      }
    } catch (e) {
      console.error(e);
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
        alert('Wedding Project created! 25+ Instant Planning tasks and digital agreement generated.');
        setIsWizardOpen(false);
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <Crown className="w-4 h-4 text-gold-dark" />
            <span>Active Portfolio</span>
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
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Wedding Project</span>
        </button>
      </div>

      {/* Weddings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {weddings.map((w) => (
          <div
            key={w.id}
            className="bg-white border-2 border-gold/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-navy-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2.5 py-0.5 rounded-full">
                  {w.weddingCode}
                </span>
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

              <div className="mt-3">
                <h3 className="font-serif text-xl font-bold text-navy-900">
                  {w.brideName} & {w.groomName}
                </h3>
                <div className="text-xs text-darkText/70 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                    <span>{w.location}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                    <span>{new Date(w.weddingDate).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              {/* Progress & Inclusions */}
              <div className="mt-4 bg-cream-100 p-3.5 rounded-xl border border-navy-100 space-y-2 text-xs">
                <div className="flex justify-between items-center text-darkText/80">
                  <span>Instant Planning Milestones:</span>
                  <span className="font-bold text-navy-900">
                    {w.tasksCompleted} / {w.tasksCount} Done ({w.tasksProgress}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-navy-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-gradient rounded-full transition-all"
                    style={{ width: `${w.tasksProgress}%` }}
                  />
                </div>

                <div className="flex justify-between items-center pt-1 text-[11px] text-darkText/70">
                  <span>Digital Agreement: <strong>{w.agreementStatus}</strong></span>
                  <span>Planner: <strong>{w.plannerName}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-navy-100">
              <div className="text-xs">
                <span className="text-darkText/60">Budget Base:</span>{' '}
                <strong className="text-royal">₹{(w.budgetMin / 100000).toFixed(1)} Lakh</strong>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/quotations"
                  className="px-3 py-1.5 rounded-lg border border-gold text-gold-dark font-bold text-xs hover:bg-gold/10 transition-colors"
                >
                  3-Vendor Quotes
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

      {/* New Wedding Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-cream border border-gold rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-navy-gradient text-white p-6 border-b border-gold/30 relative">
              <button
                onClick={() => setIsWizardOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-gold hover:text-white hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-serif text-2xl font-bold text-cream">Initialize New Wedding Project</h3>
              <p className="text-xs text-cream-300 mt-1">
                Creates project with digital agreement, milestones, and 25+ automated lead-time tasks.
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
                    className={`p-3 rounded-xl border text-left font-semibold ${
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
                    className={`p-3 rounded-xl border text-left font-semibold ${
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
                  className="px-4 py-2 font-medium text-darkText"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 disabled:opacity-50"
                >
                  {creating ? 'Generating 25+ Tasks...' : 'Create Wedding & Auto-Generate Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
