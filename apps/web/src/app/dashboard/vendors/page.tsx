'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building,
  Star,
  Phone,
  Mail,
  MapPin,
  Tag,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { VendorCategory } from '@grand-bandhan/shared';

export default function VendorsDirectoryPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterApproval, setFilterApproval] = useState<string>('ALL');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function loadVendors() {
    try {
      const res = await apiRequest('/api/vendors');
      if (res.success && res.data) {
        setVendors(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendors();
  }, []);

  async function handleApprove(vendorId: string, vendorName: string) {
    setApprovingId(vendorId);
    try {
      const res = await apiRequest(`/api/vendors/${vendorId}/approve`, {
        method: 'PATCH',
      });
      if (res.success) {
        setVendors((prev) =>
          prev.map((v) => (v.id === vendorId ? { ...v, isApproved: true } : v))
        );
        setToastMessage(`🎉 ${vendorName} approved successfully! Approval email sent to vendor.`);
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve vendor');
    } finally {
      setApprovingId(null);
    }
  }

  const categories = Object.values(VendorCategory);

  const pendingCount = vendors.filter((v) => v.isApproved === false).length;

  const filtered = vendors.filter((v) => {
    if (filterCategory !== 'ALL' && v.category !== filterCategory) return false;
    if (filterApproval === 'PENDING' && v.isApproved !== false) return false;
    if (filterApproval === 'VERIFIED' && v.isApproved === false) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <Building className="w-4 h-4 text-gold-dark" />
            <span>Master Vendor Ecosystem</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            Vendor Directory &amp; Governance
          </h2>
          <p className="text-xs text-darkText/70">
            Approved luxury artisans, royal caterers, palace decorators, and certified sound engineers ready for Multi-Vendor RFPs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vendor-register"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Public Vendor Form</span>
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 text-xs bg-green-50 border border-green-300 text-green-900 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-green-700 hover:text-green-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Approval Status Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterApproval('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
            filterApproval === 'ALL'
              ? 'bg-navy-900 text-gold border-gold'
              : 'bg-white border-navy-200 text-darkText hover:border-gold'
          }`}
        >
          All Vendors ({vendors.length})
        </button>

        <button
          onClick={() => setFilterApproval('PENDING')}
          className={`px-3 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
            filterApproval === 'PENDING'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white border-amber-300 text-amber-800 hover:border-amber-500'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Verification ({pendingCount})</span>
        </button>

        <button
          onClick={() => setFilterApproval('VERIFIED')}
          className={`px-3 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
            filterApproval === 'VERIFIED'
              ? 'bg-navy-900 text-gold border-gold'
              : 'bg-white border-navy-200 text-darkText hover:border-gold'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
          <span>Verified Partners ({vendors.length - pendingCount})</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="bg-white p-3.5 rounded-xl border border-gold/30 shadow-sm flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-2.5 py-1 rounded-md font-semibold text-[11px] border transition-all ${
            filterCategory === 'ALL'
              ? 'bg-navy-950 text-gold border-gold'
              : 'bg-white border-navy-200 text-darkText hover:border-gold'
          }`}
        >
          All ({vendors.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] border transition-all ${
              filterCategory === cat
                ? 'bg-navy-950 text-gold border-gold'
                : 'bg-white border-navy-200 text-darkText hover:border-gold'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((v) => (
          <div
            key={v.id}
            className={`bg-white border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 ${
              v.isApproved === false ? 'border-amber-400 bg-amber-50/20' : 'border-gold/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-navy-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark bg-gold/15 px-2.5 py-0.5 rounded-full">
                  {v.category.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{v.rating || 4.9}</span>
                </div>
              </div>

              <h3 className="font-serif text-lg font-bold text-navy-900 mt-3 flex items-center justify-between">
                <span>{v.name}</span>
                {v.isApproved === false && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                    Pending Approval
                  </span>
                )}
              </h3>

              <div className="space-y-1.5 text-xs text-darkText/75 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-darkText/50">Contact:</span>
                  <strong className="text-navy-900">{v.contactPerson}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gold-dark" />
                  <span>{v.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gold-dark" />
                  <span className="font-mono">{v.email}</span>
                </div>
                {v.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                    <span>{v.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-navy-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-darkText/60">Base Pricing:</span>{' '}
                <strong className="text-royal">₹{Number(v.basePrice || 0).toLocaleString()}</strong>
              </div>

              {v.isApproved === false ? (
                <button
                  type="button"
                  disabled={approvingId === v.id}
                  onClick={() => handleApprove(v.id, v.name)}
                  className="px-3 py-1.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold text-xs shadow-sm flex items-center gap-1 disabled:opacity-50 transition-all"
                >
                  {approvingId === v.id ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Partner</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-green-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>Verified Partner</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
