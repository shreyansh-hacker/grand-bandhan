'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { VendorCategory } from '@grand-bandhan/shared';

export default function VendorsDirectoryPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

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

  const categories = Object.values(VendorCategory);

  const filtered = vendors.filter((v) => {
    if (filterCategory !== 'ALL' && v.category !== filterCategory) return false;
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
            Vendor Directory & Performance History
          </h2>
          <p className="text-xs text-darkText/70">
            Approved luxury artisans, royal caterers, palace decorators, and certified sound engineers ready for 3-vendor RFPs.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
            filterCategory === 'ALL'
              ? 'bg-navy-900 text-gold border-gold'
              : 'bg-white border-navy-200 text-darkText hover:border-gold'
          }`}
        >
          All Categories ({vendors.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
              filterCategory === cat
                ? 'bg-navy-900 text-gold border-gold'
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
            className="bg-white border-2 border-gold/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-navy-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2.5 py-0.5 rounded-full">
                  {v.category.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{v.rating || 4.9}</span>
                </div>
              </div>

              <h3 className="font-serif text-lg font-bold text-navy-900 mt-3">
                {v.name}
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
                  <span>{v.email}</span>
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
                <strong className="text-royal">₹{v.basePrice.toLocaleString()}</strong>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-green-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Verified</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
