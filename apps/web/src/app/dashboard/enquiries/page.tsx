'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  Eye,
  X,
  Crown,
  Sparkles,
  ExternalLink,
  FileCheck,
  Heart,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { EnquiryStatus, PlanningForSide } from '@grand-bandhan/shared';
import EnquiryModal from '@/components/EnquiryModal';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSide, setFilterSide] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);

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
        setSelectedEnquiry(null);
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = e.customerName?.toLowerCase().includes(q);
      const matchPartner = e.partnerName?.toLowerCase().includes(q);
      const matchEmail = e.email?.toLowerCase().includes(q);
      const matchPhone = e.phone?.toLowerCase().includes(q);
      const matchRef = e.referenceNumber?.toLowerCase().includes(q);
      const matchLoc = e.location?.toLowerCase().includes(q);
      if (!matchName && !matchPartner && !matchEmail && !matchPhone && !matchRef && !matchLoc) return false;
    }
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
            Multi-channel leads captured from Website, WhatsApp, Instagram, and referrals with full couple dossier.
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

      {/* Filter Controls & Search */}
      <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-darkText/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search couple, email, phone, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-navy-200 rounded-lg text-xs w-64 focus:outline-none focus:border-royal text-navy-900"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-royal" />
            <span className="font-semibold text-navy-900">Planning For:</span>
            <div className="flex rounded-lg border border-navy-200 overflow-hidden">
              {['ALL', 'BRIDE_SIDE', 'GROOM_SIDE', 'BOTH'].map((side) => (
                <button
                  key={side}
                  onClick={() => setFilterSide(side)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    filterSide === side
                      ? 'bg-navy-900 text-gold'
                      : 'bg-cream-50 text-darkText/80 hover:bg-cream-100'
                  }`}
                >
                  {side === 'ALL'
                    ? 'All Sides'
                    : side === 'BRIDE_SIDE'
                    ? 'Bride Side 👰'
                    : side === 'GROOM_SIDE'
                    ? 'Groom Side 🤵'
                    : 'Both'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-navy-900">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-navy-200 rounded-lg px-2.5 py-1.5 bg-cream-50 font-medium text-navy-900 text-xs focus:outline-none focus:border-royal"
          >
            <option value="ALL">All Statuses</option>
            <option value={EnquiryStatus.NEW}>New Leads</option>
            <option value={EnquiryStatus.CONTACTED}>Contacted</option>
            <option value={EnquiryStatus.CONSULTATION_SCHEDULED}>Consultation Scheduled</option>
            <option value={EnquiryStatus.CONSULTATION_COMPLETED}>Consultation Completed</option>
            <option value={EnquiryStatus.PROPOSAL_SENT}>Proposal Sent</option>
            <option value={EnquiryStatus.BOOKING_PENDING}>Booking Pending</option>
            <option value={EnquiryStatus.CONVERTED}>Converted</option>
            <option value={EnquiryStatus.LOST}>Lost / Closed</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gold/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-navy-950 text-gold-light border-b border-gold/20 text-[11px] uppercase tracking-wider font-semibold">
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
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-navy-900 text-sm">
                          {enq.customerName}
                          {enq.partnerName && (
                            <span className="text-royal font-normal ml-1">
                              &amp; {enq.partnerName}
                            </span>
                          )}
                        </div>
                        {enq.referenceNumber && (
                          <span className="px-1.5 py-0.5 rounded bg-gold/15 text-navy-900 font-mono text-[10px] font-bold border border-gold/30">
                            {enq.referenceNumber}
                          </span>
                        )}
                      </div>
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
                      ) : enq.planningFor === 'BOTH' ? (
                        <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200">
                          Both Sides 💍
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-navy-50 text-navy-800 font-medium text-[11px]">
                          Not Specified
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-navy-900">{enq.location}</div>
                      <div className="text-darkText/60 mt-0.5 flex items-center gap-1">
                        <span>{enq.weddingDate ? new Date(enq.weddingDate).toLocaleDateString() : 'Date Tentative'}</span>
                        {enq.isDateFlexible && <span className="text-[10px] text-royal font-medium">(Flexible)</span>}
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
                              : enq.status === EnquiryStatus.CONSULTATION_COMPLETED
                              ? 'bg-teal-100 text-teal-800'
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
                      <div className="flex items-center justify-end gap-2">
                        {/* View Full Dossier Button */}
                        <button
                          onClick={() => setSelectedEnquiry(enq)}
                          className="px-2.5 py-1.5 rounded-lg bg-navy-50 text-navy-900 hover:bg-gold/20 border border-navy-200 font-semibold text-[11px] transition-colors flex items-center gap-1"
                          title="View Full Couple Intake Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </button>

                        {enq.status !== EnquiryStatus.CONVERTED && (
                          <Link
                            href={`/dashboard/consultations?enquiryId=${enq.id}`}
                            className="px-2.5 py-1.5 rounded-lg border border-gold/40 text-royal hover:bg-cream-200 font-semibold text-[11px] transition-colors"
                          >
                            Consultation 📅
                          </Link>
                        )}

                        {enq.status === EnquiryStatus.CONVERTED ? (
                          <span className="text-green-700 font-bold text-xs flex items-center gap-1">
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL COUPLE & INTAKE DOSSIER MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-gold/40 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Imperial Header */}
            <div className="bg-navy-950 p-6 text-cream border-b border-gold/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-light">
                  <Crown className="w-4 h-4 text-gold" />
                  <span>Royal Wedding Intake Dossier</span>
                  <span className="px-2 py-0.5 rounded bg-gold/20 text-gold font-mono font-bold text-[11px]">
                    {selectedEnquiry.referenceNumber || 'GB-ENQ-2026'}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-cream mt-1 flex items-center gap-2">
                  <span>{selectedEnquiry.customerName}</span>
                  {selectedEnquiry.partnerName && (
                    <span className="text-gold-light font-normal text-xl">
                      &amp; {selectedEnquiry.partnerName}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-cream-400 mt-1">
                  Registered in Grand Bandhan Registry on {new Date(selectedEnquiry.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 rounded-lg bg-navy-900 text-cream-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* Status & Side Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-cream-50 rounded-xl border border-navy-100">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-navy-900">Current Stage:</span>
                  <span className="px-2.5 py-1 rounded bg-navy-900 text-gold font-bold uppercase text-[10px] tracking-wider">
                    {selectedEnquiry.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-navy-900">Planning Side:</span>
                  <span className="font-bold text-royal text-xs">
                    {selectedEnquiry.planningFor === 'BRIDE_SIDE'
                      ? 'Bride Side 👰'
                      : selectedEnquiry.planningFor === 'GROOM_SIDE'
                      ? 'Groom Side 🤵'
                      : selectedEnquiry.planningFor === 'BOTH'
                      ? 'Both Sides 💍'
                      : 'Not Specified'}
                  </span>
                </div>
              </div>

              {/* Grid Section 1: Couple Identity & Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-navy-100 shadow-sm space-y-2.5">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-royal">
                    <Heart className="w-3.5 h-3.5 text-gold-dark" />
                    <span>Couple &amp; Family Identity</span>
                  </h4>
                  <div className="space-y-1.5 text-xs text-navy-900">
                    <div>
                      <span className="text-darkText/60 block text-[10px]">Primary Contact (Bride / Groom):</span>
                      <strong className="text-sm text-navy-950">{selectedEnquiry.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-darkText/60 block text-[10px]">Partner Name:</span>
                      <strong className="text-sm text-navy-950">{selectedEnquiry.partnerName || 'Not recorded yet'}</strong>
                    </div>
                    <div>
                      <span className="text-darkText/60 block text-[10px]">Lead Source:</span>
                      <span className="font-semibold">{selectedEnquiry.source || 'Website Application'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-navy-100 shadow-sm space-y-2.5">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-royal">
                    <Phone className="w-3.5 h-3.5 text-gold-dark" />
                    <span>Communication &amp; Contact</span>
                  </h4>
                  <div className="space-y-1.5 text-xs text-navy-900">
                    <div>
                      <span className="text-darkText/60 block text-[10px]">Email Address:</span>
                      <a href={`mailto:${selectedEnquiry.email}`} className="font-semibold text-royal hover:underline">
                        {selectedEnquiry.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-darkText/60 block text-[10px]">Phone / WhatsApp:</span>
                      <a href={`tel:${selectedEnquiry.phone}`} className="font-semibold text-royal hover:underline">
                        {selectedEnquiry.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-darkText/60 block text-[10px]">Preferred Contact Method:</span>
                      <span className="font-bold uppercase text-[11px] text-navy-800">
                        {selectedEnquiry.preferredContactMethod || 'PHONE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Section 2: Celebration Parameters */}
              <div className="p-4 bg-white rounded-xl border border-navy-100 shadow-sm space-y-3">
                <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-royal">
                  <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                  <span>Celebration Specifications</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-cream-50 rounded-lg">
                    <span className="text-darkText/60 block text-[10px]">Destination / Venue</span>
                    <strong className="text-navy-950 font-semibold">{selectedEnquiry.location}</strong>
                  </div>
                  <div className="p-2.5 bg-cream-50 rounded-lg">
                    <span className="text-darkText/60 block text-[10px]">Ceremony Date</span>
                    <strong className="text-navy-950 font-semibold">
                      {selectedEnquiry.weddingDate ? new Date(selectedEnquiry.weddingDate).toLocaleDateString('en-IN') : 'Date Tentative'}
                    </strong>
                    {selectedEnquiry.isDateFlexible && <span className="text-[10px] text-green-700 block font-bold">Flexible Date</span>}
                  </div>
                  <div className="p-2.5 bg-cream-50 rounded-lg">
                    <span className="text-darkText/60 block text-[10px]">Guest Guarantee</span>
                    <strong className="text-royal font-bold text-sm">{selectedEnquiry.guestCount} Guests</strong>
                  </div>
                  <div className="p-2.5 bg-cream-50 rounded-lg">
                    <span className="text-darkText/60 block text-[10px]">Budget Bracket</span>
                    <strong className="text-navy-950 font-bold text-xs">
                      ₹{(selectedEnquiry.minBudget / 100000).toFixed(0)}L - ₹{(selectedEnquiry.maxBudget / 100000).toFixed(0)}L
                    </strong>
                  </div>
                </div>
              </div>

              {/* Grid Section 3: Events & Scope */}
              {(selectedEnquiry.eventsRequired?.length > 0 || selectedEnquiry.servicesRequired?.length > 0 || selectedEnquiry.theme) && (
                <div className="p-4 bg-white rounded-xl border border-navy-100 shadow-sm space-y-3">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-royal">
                    <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
                    <span>Ceremonial Scope &amp; Theme</span>
                  </h4>
                  {selectedEnquiry.theme && (
                    <div className="text-xs">
                      <span className="text-darkText/60 block text-[10px]">Theme / Styling Preference:</span>
                      <span className="font-semibold text-navy-900">{selectedEnquiry.theme}</span>
                    </div>
                  )}
                  {selectedEnquiry.eventsRequired?.length > 0 && (
                    <div>
                      <span className="text-darkText/60 block text-[10px] mb-1">Required Events:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEnquiry.eventsRequired.map((ev: string) => (
                          <span key={ev} className="px-2 py-0.5 rounded bg-royal/10 text-royal font-medium text-[11px]">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedEnquiry.servicesRequired?.length > 0 && (
                    <div>
                      <span className="text-darkText/60 block text-[10px] mb-1">Required Services:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEnquiry.servicesRequired.map((srv: string) => (
                          <span key={srv} className="px-2 py-0.5 rounded bg-gold/15 text-navy-900 font-medium text-[11px] border border-gold/30">
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes / In-App Message */}
              {selectedEnquiry.notes && (
                <div className="p-4 bg-cream-50 rounded-xl border border-gold/30 space-y-1.5">
                  <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-royal">
                    <MessageSquare className="w-3.5 h-3.5 text-gold-dark" />
                    <span>Client Intake Notes &amp; Special Requests</span>
                  </h4>
                  <p className="text-xs text-navy-900 whitespace-pre-wrap italic">
                    &quot;{selectedEnquiry.notes}&quot;
                  </p>
                </div>
              )}

              {/* Assigned Planner */}
              <div className="p-4 bg-navy-50 rounded-xl border border-navy-200 flex items-center justify-between">
                <div>
                  <span className="text-darkText/60 text-[10px] block font-semibold uppercase">Assigned Planner:</span>
                  <span className="font-bold text-navy-900 text-sm">
                    {selectedEnquiry.assignedPlanner?.name || 'Unassigned (Awaiting Assignment)'}
                  </span>
                  {selectedEnquiry.assignedPlanner?.email && (
                    <span className="text-xs text-darkText/70 block">
                      {selectedEnquiry.assignedPlanner.email}
                    </span>
                  )}
                </div>
                <Link
                  href={`/dashboard/consultations?enquiryId=${selectedEnquiry.id}`}
                  className="px-3 py-1.5 bg-navy-900 text-gold rounded-lg font-bold text-xs hover:bg-navy-800 transition-colors shadow-sm"
                >
                  Manage Planner &amp; Consultation 📅
                </Link>
              </div>
            </div>

            {/* Modal Action Bar */}
            <div className="bg-cream-50 p-4 border-t border-navy-100 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`/enquiry/${selectedEnquiry.referenceNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl border border-navy-300 text-navy-900 hover:bg-cream-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-royal" />
                <span>View Public Lifecycle Stepper Tracker</span>
              </a>

              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/agreements?enquiryId=${selectedEnquiry.id}`}
                  className="px-3.5 py-2 rounded-xl border border-gold/50 bg-white text-royal hover:bg-cream-100 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <FileCheck className="w-3.5 h-3.5 text-gold-dark" />
                  <span>Service Agreement Desk</span>
                </Link>

                {selectedEnquiry.status !== EnquiryStatus.CONVERTED && (
                  <button
                    onClick={() => handleConvert(selectedEnquiry.id)}
                    disabled={convertingId === selectedEnquiry.id}
                    className="px-4 py-2 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>{convertingId === selectedEnquiry.id ? 'Converting...' : 'Convert to Wedding Project 💍'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
