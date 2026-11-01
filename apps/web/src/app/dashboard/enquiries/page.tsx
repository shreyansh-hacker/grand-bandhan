'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ArrowRight,

  Plus,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { EnquiryStatus, PlanningForSide } from '@grand-bandhan/shared';
import EnquiryModal from '@/components/EnquiryModal';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSide, setFilterSide] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  async function loadEnquiries() {
    try {
      const res = await apiRequest('/api/enquiries');
      if (res.success && res.data) {
        setEnquiries(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function handleConvert(id: string) {
    setConvertingId(id);
    try {
      const res = await apiRequest(`/api/enquiries/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify({ packageType: 'FULL_SERVICE' }),
      });
      if (res.success) {
        alert('Enquiry converted! New wedding created with 25+ auto tasks and digital agreement generated.');
        loadEnquiries();
      } else {
        alert(res.message || 'Conversion failed');
      }
    } catch (e: any) {
      alert(e.message || 'Error converting');
    } finally {
      setConvertingId(null);
    }
  }

  const filtered = enquiries.filter((e) => {
    if (filterSide !== 'ALL' && e.planningFor !== filterSide) return false;
    if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <Users className="w-4 h-4 text-gold-dark" />
            <span>CRM & Intake Pipeline</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            Customer Enquiries Management
          </h2>
          <p className="text-xs text-darkText/70">
            Multi-channel leads captured from Website, WhatsApp, Instagram, and referrals with Bride/Groom side tracking.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Lead</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-navy-900 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Planning For:</span>
          </span>
          {[
            { id: 'ALL', label: 'All Sides' },
            { id: PlanningForSide.BRIDE_SIDE, label: 'Bride Side 👰' },
            { id: PlanningForSide.GROOM_SIDE, label: 'Groom Side 🤵' },
            { id: PlanningForSide.NOT_SPECIFIED, label: 'Unspecified' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterSide(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filterSide === item.id
                  ? 'bg-navy-900 text-gold border-gold'
                  : 'bg-white text-navy-800 border-navy-200 hover:border-gold/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-darkText/70">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-navy-200 bg-white font-medium focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Statuses</option>
            <option value={EnquiryStatus.NEW}>New</option>
            <option value={EnquiryStatus.CONSULTATION_SCHEDULED}>Consultation Scheduled</option>
            <option value={EnquiryStatus.PROPOSAL_SENT}>Proposal Sent</option>
            <option value={EnquiryStatus.CONVERTED}>Converted</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white border border-gold/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-navy-950 text-gold uppercase tracking-wider font-semibold border-b border-gold/30">
                <th className="p-4">Customer / Couple</th>
                <th className="p-4">Planning Side</th>
                <th className="p-4">Destination & Date</th>
                <th className="p-4">Guests & Budget</th>
                <th className="p-4">Source & Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-darkText/60">
                    No enquiries match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((enq) => (
                  <tr key={enq.id} className="hover:bg-cream-100 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-navy-900 text-sm">{enq.customerName}</div>
                      <div className="text-darkText/70 flex items-center gap-2 mt-0.5">
                        <span>{enq.email}</span> • <span>{enq.phone}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      {enq.planningFor === PlanningForSide.BRIDE_SIDE ? (
                        <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 font-bold text-[11px] border border-pink-200">
                          Bride Side 👰
                        </span>
                      ) : enq.planningFor === PlanningForSide.GROOM_SIDE ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] border border-blue-200">
                          Groom Side 🤵
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-navy-50 text-navy-800 font-medium text-[11px]">
                          Not Specified
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-navy-900">{enq.location}</div>
                      <div className="text-darkText/60 mt-0.5">
                        {enq.weddingDate ? new Date(enq.weddingDate).toLocaleDateString() : 'Date Tentative'}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-royal">{enq.guestCount} Guests</div>
                      <div className="text-darkText/70 mt-0.5">
                        ₹{(enq.minBudget / 100000).toFixed(0)}L - ₹{(enq.maxBudget / 100000).toFixed(0)}L
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-navy-900">{enq.source}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            enq.status === EnquiryStatus.CONVERTED
                              ? 'bg-green-100 text-green-800'
                              : enq.status === EnquiryStatus.PROPOSAL_SENT
                              ? 'bg-purple-100 text-purple-800'
                              : enq.status === EnquiryStatus.CONSULTATION_SCHEDULED
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-navy-100 text-navy-800'
                          }`}
                        >
                          {enq.status}
                        </span>
                      </div>
                      {enq.notes && (
                        <p className="text-[11px] text-darkText/70 mt-1 line-clamp-1 italic">
                          &quot;{enq.notes}&quot;
                        </p>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {enq.status === EnquiryStatus.CONVERTED ? (
                        <span className="text-green-700 font-bold text-xs flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Converted</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConvert(enq.id)}
                          disabled={convertingId === enq.id}
                          className="px-3 py-1.5 rounded-lg bg-navy-900 text-gold font-bold text-[11px] hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50"
                        >
                          {convertingId === enq.id ? 'Converting...' : 'Convert to Wedding →'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EnquiryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          loadEnquiries();
        }}
      />
    </div>
  );
}
