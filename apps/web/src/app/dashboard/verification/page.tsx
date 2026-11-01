'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,

  MessageSquare,
  FileImage,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { ServiceVerificationStatus, VerificationResponse } from '@grand-bandhan/shared';
import { DocumentUploader } from '@/features';

export default function VerificationPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [wedding, setWedding] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<any | null>(null);
  const [issueNote, setIssueNote] = useState('');
  const [vendorResponseText, setVendorResponseText] = useState('');
  const [processing, setProcessing] = useState(false);

  async function loadVerifications() {
    try {
      const wRes = await apiRequest('/api/weddings');
      if (wRes.success && wRes.data && wRes.data.length > 0) {
        const w = wRes.data[0];
        setWedding(w);
        const vRes = await apiRequest(`/api/verifications?weddingId=${w.id}`);
        if (vRes.success && vRes.data) {
          setVerifications(vRes.data);
          if (vRes.data.length > 0) {
            setSelectedVerification(vRes.data[0]);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVerifications();
  }, []);

  async function handleVerificationResponse(responseType: VerificationResponse) {
    if (!selectedVerification) return;
    setProcessing(true);

    try {
      const res = await apiRequest(`/api/verifications/${selectedVerification.id}/respond`, {
        method: 'POST',
        body: JSON.stringify({
          response: responseType,
          issueNotes: issueNote || `Service confirmed as ${responseType}`,
          evidencePhotos: [],
        }),
      });

      if (res.success) {
        alert(res.message);
        loadVerifications();
      }
    } catch (e: any) {
      alert(e.message || 'Error updating verification');
    } finally {
      setProcessing(false);
    }
  }

  async function handleVendorRebuttal() {
    if (!selectedVerification || !vendorResponseText) return;
    setProcessing(true);

    try {
      const res = await apiRequest(`/api/verifications/${selectedVerification.id}/vendor-response`, {
        method: 'POST',
        body: JSON.stringify({
          vendorResponseNotes: vendorResponseText,
        }),
      });

      if (res.success) {
        alert(res.message);
        setVendorResponseText('');
        loadVerifications();
      }
    } catch (e: any) {
      alert(e.message || 'Error submitting response');
    } finally {
      setProcessing(false);
    }
  }

  async function handleFinalResolve(outcome: 'RESOLVED' | 'DISPUTED') {
    if (!selectedVerification) return;
    setProcessing(true);

    try {
      const res = await apiRequest(`/api/verifications/${selectedVerification.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          resolutionOutcome: outcome,
          notes: outcome === 'RESOLVED' ? 'Issue resolved after vendor remediation.' : 'Service penalty applied to final settlement.',
        }),
      });

      if (res.success) {
        alert(res.message);
        loadVerifications();
      }
    } catch (e: any) {
      alert(e.message || 'Error finalizing resolution');
    } finally {
      setProcessing(false);
    }
  }

  const v = selectedVerification;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <ShieldCheck className="w-4 h-4 text-gold-dark" />
            <span>Operational Quality & Escrow Governance</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            Service Verification & Dispute Resolution
          </h2>
          <p className="text-xs text-darkText/70">
            Automated confirmation requests triggered for key vendors (e.g. DJ scheduled at 7:00 PM) before payment disbursement.
          </p>
        </div>
      </div>

      {/* Operational Protocol Banner */}
      <div className="bg-navy-900 text-white p-4 rounded-xl border border-gold/40 flex items-start gap-3 text-xs shadow-md">

        <div className="space-y-1">
          <div className="font-bold text-gold uppercase tracking-wider">
            Operational Protocol – DJ & Critical Services Verification
          </div>
          <p className="text-cream-300 leading-relaxed">
            At the configured confirmation time, Client or Assigned On-ground Staff receives a prompt: <em>&quot;Has the service started / been delivered?&quot;</em> Missed confirmations are held in pending queue without assuming failure. If an issue is reported, vendor rebuttal and auditable resolution occur before post-wedding settlement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Verification Queue (Left Column) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-900 block">
            Verification Queue ({verifications.length})
          </span>

          {verifications.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedVerification(item)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedVerification?.id === item.id
                  ? 'bg-navy-950 text-white border-gold shadow-gold-glow'
                  : 'bg-white border-navy-200 hover:border-gold/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                  {item.vendor?.name || 'Assigned Vendor'}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    item.status === ServiceVerificationStatus.CONFIRMED
                      ? 'bg-green-100 text-green-900'
                      : item.status === ServiceVerificationStatus.ISSUE_REPORTED
                      ? 'bg-red-100 text-red-900'
                      : item.status === ServiceVerificationStatus.RESOLVED
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>

              <h4 className={`font-serif text-base font-bold mt-1.5 ${selectedVerification?.id === item.id ? 'text-cream' : 'text-navy-900'}`}>
                {item.serviceName}
              </h4>

              <div className="flex items-center gap-2 text-xs text-darkText/60 mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Confirmation Window: {new Date(item.scheduledConfirmationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Detail & Interactive Resolution Box (Right Column) */}
        {v && (
          <div className="lg:col-span-7 bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="pb-4 border-b border-navy-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">
                  Verification Audit Card
                </span>
                <span
                  className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    v.status === ServiceVerificationStatus.CONFIRMED
                      ? 'bg-green-100 text-green-900'
                      : v.status === ServiceVerificationStatus.ISSUE_REPORTED
                      ? 'bg-red-100 text-red-900'
                      : v.status === ServiceVerificationStatus.RESOLVED
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {v.status.replace(/_/g, ' ')}
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-navy-900 mt-2">
                {v.serviceName}
              </h3>
              <p className="text-xs text-darkText/70 mt-1">
                Vendor: <strong>{v.vendor?.name}</strong> | Category: <strong>{v.vendor?.category}</strong>
              </p>
            </div>

            {/* Prompt Card: Four possible responses */}
            <div className="bg-cream-100 p-5 rounded-xl border border-gold/30 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-navy-900 block">
                Verification Inquiry Prompt:
              </span>
              <p className="text-sm font-serif font-bold text-navy-900">
                &quot;Has the {v.serviceName} started / been delivered to specifications?&quot;
              </p>

              {v.status === ServiceVerificationStatus.AWAITING_CONFIRMATION && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <button
                      onClick={() => handleVerificationResponse(VerificationResponse.COMPLETED)}
                      disabled={processing}
                      className="p-3 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Yes, Completed</span>
                    </button>

                    <button
                      onClick={() => handleVerificationResponse(VerificationResponse.INCOMPLETE)}
                      disabled={processing}
                      className="p-3 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Started Incomplete</span>
                    </button>

                    <button
                      onClick={() => handleVerificationResponse(VerificationResponse.NOT_DELIVERED)}
                      disabled={processing}
                      className="p-3 rounded-lg bg-red-700 text-white hover:bg-red-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Not Delivered</span>
                    </button>

                    <button
                      onClick={() => handleVerificationResponse(VerificationResponse.ISSUE_REPORTED)}
                      disabled={processing}
                      className="p-3 rounded-lg bg-navy-900 text-gold border border-gold hover:bg-navy-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <AlertTriangle className="w-4 h-4 text-gold" />
                      <span>Report an Issue</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={issueNote}
                    onChange={(e) => setIssueNote(e.target.value)}
                    placeholder="Optional feedback notes or issue description (e.g. DJ arrived 20 min late, sound check ongoing)"
                    className="w-full p-2.5 bg-white border border-navy-200 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            {/* Vendor Rebuttal / Response Section */}
            {(v.status === ServiceVerificationStatus.ISSUE_REPORTED || v.status === ServiceVerificationStatus.UNDER_RESOLUTION) && (
              <div className="bg-amber-50 p-5 rounded-xl border border-amber-300 space-y-3 text-xs">
                <span className="font-bold text-amber-900 uppercase tracking-wider block">
                  Vendor Escalation & Response Channel
                </span>
                <p className="text-amber-800">
                  Issue was reported to vendor. Allow vendor to explain cause or provide corrective action.
                </p>

                <textarea
                  rows={2}
                  value={vendorResponseText}
                  onChange={(e) => setVendorResponseText(e.target.value)}
                  placeholder="Vendor explanation: e.g. 'Subwoofer generator had a minor delay at loading gate. Extended set by 45 minutes to compensate.'"
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs"
                />

                <button
                  onClick={handleVendorRebuttal}
                  disabled={processing}
                  className="px-4 py-2 bg-amber-900 text-white font-bold rounded-lg text-xs shadow-sm hover:bg-amber-950"
                >
                  Submit Vendor Rebuttal
                </button>
              </div>
            )}

            {/* Final Resolution Buttons */}
            {v.status === ServiceVerificationStatus.VENDOR_RESPONDED && (
              <div className="p-4 bg-navy-50 rounded-xl border border-navy-200 space-y-3 text-xs">
                <span className="font-bold text-navy-900 uppercase tracking-wider block">
                  Final Mutual Sign-off
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleFinalResolve('RESOLVED')}
                    disabled={processing}
                    className="px-4 py-2 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800"
                  >
                    Confirm Resolution (Accept Remediation)
                  </button>
                  <button
                    onClick={() => handleFinalResolve('DISPUTED')}
                    disabled={processing}
                    className="px-4 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800"
                  >
                    Mark Disputed (Deduct Penalty in Final Settlement)
                  </button>
                </div>
              </div>
            )}

            {/* Evidence & Verification Attachment (Neon PostgreSQL BYTEA) */}
            <div className="pt-2">
              <DocumentUploader
                entityType="SERVICE_VERIFICATION"
                entityId={v.id}
                title="Service Verification Evidence (Neon PostgreSQL BYTEA)"
                onUploadSuccess={(file) => {
                  setIssueNote((prev) => (prev ? `${prev} [Attachment: ${file.fileName}]` : `[Attachment: ${file.fileName}]`));
                }}
              />
            </div>

            {/* Auditable History Timeline */}
            <div className="pt-2 border-t border-navy-100 space-y-2 text-xs">
              <span className="font-bold text-navy-900 uppercase tracking-wider text-[11px] block">
                Auditable History Log
              </span>
              <div className="space-y-1.5 text-[11px] text-darkText/70 bg-cream-100 p-3 rounded-lg border border-navy-100">
                {(v.auditHistory || []).map((h: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-0.5 border-b border-navy-100/50 last:border-none">
                    <span>• {h.action || 'Updated'} {h.details ? `– ${h.details}` : ''}</span>
                    <span className="text-[10px] text-darkText/50">{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
