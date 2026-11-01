'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileCheck,
  ShieldCheck,
  AlertCircle,
  Clock,
  Printer,
  ExternalLink,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  Crown,
  Eye,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://grand-bandhan.onrender.com';

function AgreementsContent() {
  const searchParams = useSearchParams();
  const queryEnquiryId = searchParams.get('enquiryId');
  const [agreements, setAgreements] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Generate Agreement Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (queryEnquiryId) {
      setSelectedEnquiryId(queryEnquiryId);
      setShowGenerateModal(true);
    }
  }, [queryEnquiryId]);

  // Reject / Correction Modal State
  const [rejectingAgreement, setRejectingAgreement] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingRejection, setSubmittingRejection] = useState(false);

  // Action Loading
  const [actionId, setActionId] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [aRes, eRes] = await Promise.all([
        apiRequest('/api/agreements'),
        apiRequest('/api/enquiries'),
      ]);

      if (aRes.success && aRes.data) setAgreements(aRes.data);
      if (eRes.success && eRes.data) setEnquiries(eRes.data);
    } catch (e) {
      console.error('Failed to load agreements:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleVerify(id: string) {
    if (!confirm('Are you sure you want to formally verify and execute this service agreement? This will unlock active wedding operations for the couple.')) {
      return;
    }
    setActionId(id);
    try {
      const res = await apiRequest(`/api/agreements/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ status: 'VERIFIED' }),
      });
      if (res.success) {
        alert('Service Agreement verified! Active operations unlocked and verification email dispatched.');
        loadData();
      } else {
        alert(res.message || 'Verification failed');
      }
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setActionId(null);
    }
  }

  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectingAgreement || !rejectionReason.trim()) {
      alert('Please provide a specific rejection / correction reason for the couple.');
      return;
    }
    setSubmittingRejection(true);
    try {
      const res = await apiRequest(`/api/agreements/${rejectingAgreement.id}/verify`, {
        method: 'POST',
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason: rejectionReason.trim(),
        }),
      });
      if (res.success) {
        alert('Correction request logged and notification sent to couple.');
        setRejectingAgreement(null);
        setRejectionReason('');
        loadData();
      } else {
        alert(res.message || 'Rejection failed');
      }
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setSubmittingRejection(false);
    }
  }

  async function handleSendEmail(id: string) {
    setActionId(id);
    try {
      const res = await apiRequest(`/api/agreements/${id}/send`, {
        method: 'POST',
      });
      if (res.success) {
        alert('Service agreement sent to client couple via email for digital review.');
        loadData();
      } else {
        alert(res.message || 'Dispatch failed');
      }
    } catch (err: any) {
      alert(err.message || 'Dispatch failed');
    } finally {
      setActionId(null);
    }
  }

  async function handleGenerateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEnquiryId) {
      alert('Please select an enquiry lead to generate an agreement for.');
      return;
    }
    setGenerating(true);
    try {
      const res = await apiRequest('/api/agreements/generate', {
        method: 'POST',
        body: JSON.stringify({ enquiryId: selectedEnquiryId }),
      });
      if (res.success) {
        alert('Professional 20-Section Service Agreement generated successfully!');
        setShowGenerateModal(false);
        setSelectedEnquiryId('');
        loadData();
      } else {
        alert(res.message || 'Generation failed');
      }
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  const filtered = agreements.filter((a) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING_VERIFICATION') {
      return a.verificationStatus === 'PENDING' || a.status === 'SIGNED' || a.status === 'PENDING_VERIFICATION';
    }
    if (filterStatus === 'VERIFIED') {
      return a.verificationStatus === 'VERIFIED' || a.status === 'VERIFIED';
    }
    if (filterStatus === 'REJECTED') {
      return a.verificationStatus === 'REJECTED' || a.status === 'REJECTED';
    }
    return a.status === filterStatus;
  });

  const pendingVerificationCount = agreements.filter(
    (a) => (a.verificationStatus === 'PENDING' || a.status === 'SIGNED' || a.status === 'PENDING_VERIFICATION') && a.verificationStatus !== 'VERIFIED'
  ).length;

  const verifiedCount = agreements.filter(
    (a) => a.verificationStatus === 'VERIFIED' || a.status === 'VERIFIED'
  ).length;

  const rejectedCount = agreements.filter(
    (a) => a.verificationStatus === 'REJECTED' || a.status === 'REJECTED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <ShieldCheck className="w-4 h-4 text-gold-dark" />
            <span>Lifecycle Step 5 Management</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            Service Agreement &amp; Legal Verification Desk
          </h2>
          <p className="text-xs text-darkText/70">
            Generate 20-section formal contracts, inspect client digital signatures and uploaded documents, and approve verification to unlock active operations.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Agreement</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-navy-200 rounded-xl p-4 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-darkText/70 block">
            Total Agreements
          </span>
          <span className="text-2xl font-serif font-bold text-navy-900 mt-1 block">
            {agreements.length}
          </span>
          <span className="text-[11px] text-royal font-semibold">Active In Registry</span>
        </div>

        <div className="bg-white border border-amber-300 rounded-xl p-4 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            Awaiting Verification
          </span>
          <span className="text-2xl font-serif font-bold text-amber-800 mt-1 block">
            {pendingVerificationCount}
          </span>
          <span className="text-[11px] text-amber-700 font-semibold">Ready for Review</span>
        </div>

        <div className="bg-white border border-green-300 rounded-xl p-4 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 block">
            Verified &amp; Executed
          </span>
          <span className="text-2xl font-serif font-bold text-green-800 mt-1 block">
            {verifiedCount}
          </span>
          <span className="text-[11px] text-green-700 font-semibold">Active Operations Live</span>
        </div>

        <div className="bg-white border border-red-300 rounded-xl p-4 shadow-sm text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
            Corrections Required
          </span>
          <span className="text-2xl font-serif font-bold text-red-800 mt-1 block">
            {rejectedCount}
          </span>
          <span className="text-[11px] text-red-700 font-semibold">Awaiting Resubmission</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Contracts' },
            { id: 'PENDING_VERIFICATION', label: `Awaiting Review (${pendingVerificationCount})` },
            { id: 'VERIFIED', label: `Verified (${verifiedCount})` },
            { id: 'REJECTED', label: `Corrections (${rejectedCount})` },
            { id: 'DRAFT', label: 'Drafts' },
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
      </div>

      {/* Agreements Table */}
      <div className="bg-white border border-gold/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-navy-950 text-gold uppercase tracking-wider font-semibold border-b border-gold/30">
                <th className="p-4">Agreement Ref &amp; Couple</th>
                <th className="p-4">Associated Wedding / Lead</th>
                <th className="p-4">Version &amp; Format</th>
                <th className="p-4">Signature &amp; Verification Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-darkText/60">
                    No agreements found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const isVer = a.verificationStatus === 'VERIFIED' || a.status === 'VERIFIED';
                  const isRej = a.verificationStatus === 'REJECTED' || a.status === 'REJECTED';
                  const isPending = !isVer && !isRej && (a.status === 'SIGNED' || a.status === 'PENDING_VERIFICATION');

                  const coupleTitle = a.wedding
                    ? `${a.wedding.brideName} & ${a.wedding.groomName}`
                    : a.enquiry?.customerName || 'Couple Lead';

                  return (
                    <tr key={a.id} className="hover:bg-cream-100 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-navy-900 text-sm">
                          {a.agreementNumber}
                        </div>
                        <div className="font-semibold text-royal mt-0.5">{coupleTitle}</div>
                        <div className="text-[11px] text-darkText/60">
                          Created {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="p-4">
                        {a.wedding ? (
                          <div>
                            <span className="font-mono font-bold text-navy-900 block">{a.wedding.weddingCode}</span>
                            <span className="text-darkText/70 text-[11px]">{a.wedding.location}</span>
                          </div>
                        ) : a.enquiry ? (
                          <div>
                            <span className="font-mono text-darkText/80 block">Ref: {a.enquiry.referenceNumber || 'Lead'}</span>
                            <span className="text-[11px] text-darkText/60">Enquiry Stage</span>
                          </div>
                        ) : (
                          <span className="text-darkText/50 italic">Standalone</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-navy-900 block">Version {a.version || 1}.0</span>
                        <span className="text-darkText/60 text-[11px]">
                          {a.signedPdfUrl ? 'Uploaded PDF Document' : a.signatureDataUrl ? 'Canvas E-Signature' : 'Draft Contract'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                            isVer
                              ? 'bg-green-100 text-green-900 border border-green-300'
                              : isRej
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-navy-100 text-navy-900'
                          }`}
                        >
                          {isVer ? 'VERIFIED ✓' : isRej ? 'CORRECTION REQ ⚠️' : isPending ? 'AWAITING VERIFICATION ⏳' : a.status}
                        </span>

                        {a.signedByName && (
                          <div className="text-[11px] text-darkText/70 mt-1">
                            Signer: <strong>{a.signedByName}</strong> ({a.signedAt ? new Date(a.signedAt).toLocaleDateString() : ''})
                          </div>
                        )}

                        {isRej && a.rejectionReason && (
                          <p className="text-[10px] text-red-700 italic mt-0.5">
                            Reason: {a.rejectionReason}
                          </p>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {/* Preview / Print PDF button */}
                        <a
                          href={`${API_BASE_URL}/api/agreements/download/${a.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded border border-navy-200 text-navy-800 hover:bg-cream-100 font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect PDF</span>
                        </a>

                        {/* Send via Email button if DRAFT */}
                        {a.status === 'DRAFT' && (
                          <button
                            onClick={() => handleSendEmail(a.id)}
                            disabled={actionId === a.id}
                            className="px-2.5 py-1 rounded bg-navy-900 text-gold font-bold text-[11px] hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Send via Email</span>
                          </button>
                        )}

                        {/* Verify / Reject buttons if pending */}
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleVerify(a.id)}
                              disabled={actionId === a.id}
                              className="px-3 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verify ✓</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectingAgreement(a);
                                setRejectionReason('');
                              }}
                              className="px-2.5 py-1 rounded bg-red-100 text-red-800 border border-red-300 font-bold text-[11px] hover:bg-red-200 transition-colors"
                            >
                              Reject ⚠️
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE AGREEMENT MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-gold shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100">
              <h3 className="font-serif text-lg font-bold text-navy-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-gold-dark" />
                <span>Generate Service Agreement</span>
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-darkText/60 hover:text-navy-900 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Select Customer Lead / Accepted Proposal *
                </label>
                <select
                  required
                  value={selectedEnquiryId}
                  onChange={(e) => setSelectedEnquiryId(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                >
                  <option value="">-- Choose Client Lead --</option>
                  {enquiries.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.customerName} ({e.referenceNumber || 'Lead'}) — {e.location} (Status: {e.status})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-darkText/60 mt-1">
                  Pulls client parameters, agreed budgets, proposal milestones, and generates 20-section formal agreement.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-navy-200 rounded-lg text-xs font-semibold text-darkText/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 bg-gold-gradient text-navy-950 font-bold rounded-lg text-xs shadow-gold-glow hover:brightness-105 disabled:opacity-50"
                >
                  {generating ? 'Generating Document...' : 'Generate 20-Section Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT / CORRECTION MODAL */}
      {rejectingAgreement && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-red-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100">
              <h3 className="font-serif text-lg font-bold text-red-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Request Agreement Correction</span>
              </h3>
              <button onClick={() => setRejectingAgreement(null)} className="text-darkText/60 hover:text-navy-900 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <p className="text-darkText/80">
                Contract Ref: <strong>{rejectingAgreement.agreementNumber}</strong>
              </p>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Mandatory Rejection / Correction Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Signature on canvas is incomplete / uploaded PDF page 3 is illegible. Please re-upload with partner signature."
                  className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                />
                <p className="text-[11px] text-darkText/60 mt-1">
                  This note will be emailed directly to the couple and shown prominently in their portal.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setRejectingAgreement(null)}
                  className="px-4 py-2 border border-navy-200 rounded-lg text-xs font-semibold text-darkText/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRejection}
                  className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg text-xs hover:bg-red-700 disabled:opacity-50 shadow-sm"
                >
                  {submittingRejection ? 'Dispatching Notice...' : 'Reject & Notify Couple'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgreementsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-darkText/60">Loading Service Agreements Legal Desk...</div>}>
      <AgreementsContent />
    </Suspense>
  );
}
