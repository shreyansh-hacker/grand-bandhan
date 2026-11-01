'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Search,
  Filter,
  Users,
  Crown,
  Ban,
  Check,
  X,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { AgencyStatus } from '@grand-bandhan/shared';

export default function AgencyGovernancePage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Rejection/Suspension Modal
  const [actionAgency, setActionAgency] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'REJECT' | 'SUSPEND' | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function loadAgencies() {
    try {
      setLoading(true);
      const res = await apiRequest('/api/agencies/applications');
      if (res.success && res.data) {
        setAgencies(res.data);
      }
    } catch (e) {
      console.error('Failed to load agency applications:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAgencies();
  }, []);

  async function handleApprove(agency: any) {
    if (!confirm(`Are you sure you want to approve "${agency.name}"? The agency admin account will be activated and approval notifications dispatched.`)) {
      return;
    }

    setProcessing(true);
    try {
      const res = await apiRequest(`/api/agencies/${agency.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: AgencyStatus.APPROVED }),
      });

      if (res.success) {
        setToastMessage(`✅ ${agency.name} approved successfully!`);
        setTimeout(() => setToastMessage(null), 5000);
        loadAgencies();
      } else {
        alert(res.message || 'Failed to approve agency');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with server');
    } finally {
      setProcessing(false);
    }
  }

  async function handleActionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actionAgency || !actionType) return;
    if (!reasonInput.trim()) {
      alert('Please provide a reason.');
      return;
    }

    setProcessing(true);
    const targetStatus = actionType === 'REJECT' ? AgencyStatus.REJECTED : AgencyStatus.SUSPENDED;

    try {
      const res = await apiRequest(`/api/agencies/${actionAgency.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: targetStatus,
          rejectionReason: reasonInput.trim(),
        }),
      });

      if (res.success) {
        setToastMessage(`Action recorded: ${actionAgency.name} is now ${targetStatus}.`);
        setTimeout(() => setToastMessage(null), 5000);
        setActionAgency(null);
        setActionType(null);
        setReasonInput('');
        loadAgencies();
      } else {
        alert(res.message || 'Failed to update agency status');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with server');
    } finally {
      setProcessing(false);
    }
  }

  const filtered = agencies.filter((a) => {
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = a.name?.toLowerCase().includes(term);
      const matchOwner = a.ownerName?.toLowerCase().includes(term);
      const matchCity = a.city?.toLowerCase().includes(term);
      const matchEmail = a.contactEmail?.toLowerCase().includes(term);
      if (!matchName && !matchOwner && !matchCity && !matchEmail) return false;
    }
    return true;
  });

  const pendingCount = agencies.filter((a) => a.status === AgencyStatus.PENDING_APPROVAL).length;
  const approvedCount = agencies.filter((a) => a.status === AgencyStatus.APPROVED).length;
  const suspendedCount = agencies.filter((a) => a.status === AgencyStatus.SUSPENDED).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <Building2 className="w-4 h-4 text-gold-dark" />
            <span>Super Administrator Console</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            Agency Applications &amp; Governance
          </h2>
          <p className="text-xs text-darkText/70">
            Multi-tenant agency onboarding reviews, vetting verification, account activations, and compliance controls.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{pendingCount} Pending Agency Review{pendingCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="p-3 text-xs bg-green-50 border border-green-300 text-green-900 rounded-xl flex items-center justify-between shadow-sm">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-navy-900 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {[
            { id: 'ALL', label: `All (${agencies.length})` },
            { id: AgencyStatus.PENDING_APPROVAL, label: `Pending (${pendingCount})` },
            { id: AgencyStatus.APPROVED, label: `Approved (${approvedCount})` },
            { id: AgencyStatus.SUSPENDED, label: `Suspended (${suspendedCount})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filterStatus === item.id
                  ? 'bg-navy-900 text-gold border-gold'
                  : 'bg-white text-navy-800 border-navy-200 hover:border-gold/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-darkText/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by agency, owner, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-navy-200 focus:outline-none focus:border-gold bg-cream-50"
          />
        </div>
      </div>

      {/* Agency Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-darkText/60">Loading agency applications...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-darkText/60 bg-white rounded-xl border border-gold/30">
          No agency records match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((agency) => {
            const adminUser = agency.users?.[0];
            const isPending = agency.status === AgencyStatus.PENDING_APPROVAL;
            const isApproved = agency.status === AgencyStatus.APPROVED;
            const isSuspended = agency.status === AgencyStatus.SUSPENDED;

            return (
              <div
                key={agency.id}
                className={`bg-white border-2 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  isPending
                    ? 'border-amber-400 bg-amber-50/10'
                    : isApproved
                    ? 'border-gold/40'
                    : 'border-red-300 bg-red-50/10'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-navy-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-navy-900">{agency.name}</h3>
                        <span className="text-[10px] text-darkText/50 font-mono">@{agency.slug}</span>
                      </div>
                      <p className="text-xs text-darkText/70 mt-0.5">
                        Owner: <strong>{agency.ownerName || adminUser?.name || 'Authorized Admin'}</strong>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isApproved
                          ? 'bg-green-100 text-green-900 border border-green-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          : 'bg-red-100 text-red-900 border border-red-300'
                      }`}
                    >
                      {agency.status}
                    </span>
                  </div>

                  {/* Agency Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-darkText/80 py-3">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-royal" />
                      <span className="truncate">{agency.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-royal" />
                      <span>{agency.contactPhone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-royal" />
                      <span>{agency.city || 'Udaipur'}, {agency.state || 'Rajasthan'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-royal" />
                      <span>Weddings: {agency._count?.weddings || 0} • Vendors: {agency._count?.vendors || 0}</span>
                    </div>
                  </div>

                  {agency.businessDescription && (
                    <p className="text-xs text-darkText/70 italic bg-cream-50 p-2.5 rounded-lg border border-navy-100 mt-2">
                      &ldquo;{agency.businessDescription}&rdquo;
                    </p>
                  )}

                  {agency.rejectionReason && (
                    <div className="text-xs text-red-800 bg-red-50 p-2.5 rounded-lg border border-red-200 mt-2">
                      <strong>Rejection / Suspension Note:</strong> {agency.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Super Admin Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-100">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleApprove(agency)}
                        disabled={processing}
                        className="px-3.5 py-1.5 rounded-lg bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Agency</span>
                      </button>

                      <button
                        onClick={() => {
                          setActionAgency(agency);
                          setActionType('REJECT');
                          setReasonInput('');
                        }}
                        disabled={processing}
                        className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => {
                        setActionAgency(agency);
                        setActionType('SUSPEND');
                        setReasonInput('');
                      }}
                      disabled={processing}
                      className="px-3 py-1.5 rounded-lg border border-amber-400 text-amber-800 hover:bg-amber-50 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Suspend Workspace</span>
                    </button>
                  )}

                  {isSuspended && (
                    <button
                      onClick={() => handleApprove(agency)}
                      disabled={processing}
                      className="px-3.5 py-1.5 rounded-lg bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Re-Instate Workspace</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Dialog Modal for Rejection / Suspension */}
      {actionAgency && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-gold rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy-100">
              <h3 className="font-serif text-lg font-bold text-navy-900">
                {actionType === 'REJECT' ? 'Reject Agency Application' : 'Suspend Agency Workspace'}
              </h3>
              <button onClick={() => setActionAgency(null)} className="text-darkText/50 hover:text-navy-900">
                ✕
              </button>
            </div>

            <p className="text-xs text-darkText/70">
              Agency: <strong>{actionAgency.name}</strong> ({actionAgency.contactEmail})
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Reason for {actionType === 'REJECT' ? 'Rejection' : 'Suspension'} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Provide clarification or compliance requirements..."
                  className="w-full text-xs p-2.5 rounded-lg border border-navy-200 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionAgency(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-navy-200 text-navy-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Confirm {actionType === 'REJECT' ? 'Rejection' : 'Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
