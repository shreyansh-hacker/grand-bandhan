'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Video,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
  Filter,
  Search,
  ExternalLink,
  Crown,
  FileText,
  Phone,
  Mail,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

function ConsultationsContent() {
  const searchParams = useSearchParams();
  const preselectedEnquiryId = searchParams.get('enquiryId');

  const [consultations, setConsultations] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [planners, setPlanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(!!preselectedEnquiryId);
  const [scheduleData, setScheduleData] = useState({
    enquiryId: preselectedEnquiryId || '',
    scheduledAt: '',
    meetingType: 'ONLINE_VIDEO',
    meetingLink: 'https://meet.google.com/grb-wed-royal',
    meetingLocation: '',
    plannerId: '',
    clientPreferredTime: '',
    notes: '',
  });
  const [scheduling, setScheduling] = useState(false);

  // Complete Consultation Modal State
  const [completingConsultation, setCompletingConsultation] = useState<any | null>(null);
  const [completionData, setCompletionData] = useState({
    meetingNotes: '',
    coupleVision: '',
    themePreferences: '',
    guestCountConfirmed: '',
    budgetDiscussed: '',
    venuePreferences: '',
    specialRequirements: '',
    familyExpectations: '',
  });
  const [savingCompletion, setSavingCompletion] = useState(false);

  // Reschedule Modal State
  const [reschedulingConsultation, setReschedulingConsultation] = useState<any | null>(null);
  const [rescheduleData, setRescheduleData] = useState({
    scheduledAt: '',
    meetingType: 'ONLINE_VIDEO',
    meetingLink: '',
    meetingLocation: '',
    rescheduleReason: '',
  });
  const [savingReschedule, setSavingReschedule] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [cRes, eRes, pRes] = await Promise.all([
        apiRequest('/api/consultations'),
        apiRequest('/api/enquiries'),
        apiRequest('/api/profile/staff'),
      ]);

      if (cRes.success && cRes.data) setConsultations(cRes.data);
      if (eRes.success && eRes.data) setEnquiries(eRes.data);
      if (pRes.success && pRes.data) setPlanners(pRes.data);
    } catch (e) {
      console.error('Failed to load consultation data:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduleData.enquiryId || !scheduleData.scheduledAt) {
      alert('Please select an enquiry and scheduled date/time.');
      return;
    }
    setScheduling(true);
    try {
      const res = await apiRequest('/api/consultations/schedule', {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });
      if (res.success) {
        alert('First wedding consultation scheduled! Confirmation emails dispatched to couple and planner.');
        setShowScheduleModal(false);
        loadData();
      } else {
        alert(res.message || 'Scheduling failed');
      }
    } catch (err: any) {
      alert(err.message || 'Scheduling failed');
    } finally {
      setScheduling(false);
    }
  }

  async function handleCompleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!completingConsultation) return;
    setSavingCompletion(true);
    try {
      const res = await apiRequest(`/api/consultations/${completingConsultation.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          meetingNotes: completionData.meetingNotes,
          coupleVision: completionData.coupleVision || null,
          themePreferences: completionData.themePreferences || null,
          guestCountConfirmed: completionData.guestCountConfirmed ? Number(completionData.guestCountConfirmed) : null,
          budgetDiscussed: completionData.budgetDiscussed ? Number(completionData.budgetDiscussed) : null,
          venuePreferences: completionData.venuePreferences || null,
          specialRequirements: completionData.specialRequirements || null,
          familyExpectations: completionData.familyExpectations || null,
        }),
      });
      if (res.success) {
        alert('Consultation marked completed! Couple vision recorded and enquiry advanced for bespoke proposal.');
        setCompletingConsultation(null);
        loadData();
      } else {
        alert(res.message || 'Completion failed');
      }
    } catch (err: any) {
      alert(err.message || 'Completion failed');
    } finally {
      setSavingCompletion(false);
    }
  }

  async function handleRescheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reschedulingConsultation) return;
    setSavingReschedule(true);
    try {
      const res = await apiRequest(`/api/consultations/${reschedulingConsultation.id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify(rescheduleData),
      });
      if (res.success) {
        alert('Consultation rescheduled and notification emails sent.');
        setReschedulingConsultation(null);
        loadData();
      } else {
        alert(res.message || 'Reschedule failed');
      }
    } catch (err: any) {
      alert(err.message || 'Reschedule failed');
    } finally {
      setSavingReschedule(false);
    }
  }

  const filtered = consultations.filter((c) => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <Video className="w-4 h-4 text-gold-dark" />
            <span>Lifecycle Step 3 Management</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            First Consultation Studio
          </h2>
          <p className="text-xs text-darkText/70">
            Schedule virtual video design sessions or palace meetings, record couple visions, theme preferences, and confirmed budgets.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Consultation</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'SCHEDULED', 'COMPLETED', 'RESCHEDULED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filterStatus === st
                  ? 'bg-navy-900 text-gold border-gold'
                  : 'bg-white text-navy-800 border-navy-200 hover:border-gold/60'
              }`}
            >
              {st} ({st === 'ALL' ? consultations.length : consultations.filter((c) => c.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white border border-gold/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-navy-950 text-gold uppercase tracking-wider font-semibold border-b border-gold/30">
                <th className="p-4">Couple / Enquiry</th>
                <th className="p-4">Date &amp; Time</th>
                <th className="p-4">Format &amp; Link</th>
                <th className="p-4">Assigned Planner</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-darkText/60">
                    No consultations found matching this status filter.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isDone = c.status === 'COMPLETED';
                  return (
                    <tr key={c.id} className="hover:bg-cream-100 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-navy-900 text-sm">
                          {c.enquiry?.customerName} {c.enquiry?.partnerName && `& ${c.enquiry.partnerName}`}
                        </div>
                        <div className="text-darkText/60 font-mono text-[11px] mt-0.5">
                          Ref: {c.enquiry?.referenceNumber || 'N/A'} • {c.enquiry?.location}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-navy-900">
                          {new Date(c.scheduledAt).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-royal font-semibold mt-0.5">
                          {new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-navy-900 block">
                          {c.meetingType === 'IN_PERSON' ? 'Palace In-Person' : 'Google Meet Video'}
                        </span>
                        {c.meetingLink && (
                          <a
                            href={c.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-royal hover:underline text-[11px] flex items-center gap-1 mt-0.5"
                          >
                            <span>Open Video Room</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {c.meetingLocation && (
                          <span className="text-darkText/70 text-[11px] block">{c.meetingLocation}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {c.planner ? (
                          <div>
                            <span className="font-bold text-navy-900 block">{c.planner.name}</span>
                            <span className="text-darkText/60 text-[11px]">{c.planner.email}</span>
                          </div>
                        ) : (
                          <span className="text-darkText/50 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : c.status === 'SCHEDULED'
                              ? 'bg-gold/20 text-navy-900 border border-gold'
                              : c.status === 'RESCHEDULED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {c.status}
                        </span>
                        {c.coupleVision && (
                          <p className="text-[10px] text-darkText/70 mt-1 line-clamp-1 italic">
                            &quot;{c.coupleVision}&quot;
                          </p>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {!isDone && (
                          <>
                            <button
                              onClick={() => {
                                setCompletingConsultation(c);
                                setCompletionData({
                                  meetingNotes: c.meetingNotes || '',
                                  coupleVision: c.coupleVision || '',
                                  themePreferences: c.themePreferences || c.enquiry?.theme || '',
                                  guestCountConfirmed: c.guestCountConfirmed ? String(c.guestCountConfirmed) : String(c.enquiry?.guestCount || ''),
                                  budgetDiscussed: c.budgetDiscussed ? String(c.budgetDiscussed) : String(c.enquiry?.maxBudget || ''),
                                  venuePreferences: c.venuePreferences || c.enquiry?.location || '',
                                  specialRequirements: c.specialRequirements || '',
                                  familyExpectations: c.familyExpectations || '',
                                });
                              }}
                              className="px-2.5 py-1 rounded bg-navy-900 text-gold font-bold text-[11px] hover:bg-navy-800 transition-colors shadow-sm"
                            >
                              Log Notes &amp; Complete ✓
                            </button>
                            <button
                              onClick={() => {
                                setReschedulingConsultation(c);
                                setRescheduleData({
                                  scheduledAt: c.scheduledAt ? new Date(c.scheduledAt).toISOString().slice(0, 16) : '',
                                  meetingType: c.meetingType,
                                  meetingLink: c.meetingLink || '',
                                  meetingLocation: c.meetingLocation || '',
                                  rescheduleReason: '',
                                });
                              }}
                              className="px-2.5 py-1 rounded border border-navy-200 text-navy-800 hover:bg-cream-100 font-semibold text-[11px]"
                            >
                              Reschedule 🔄
                            </button>
                          </>
                        )}
                        {isDone && (
                          <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
                          </span>
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

      {/* SCHEDULE CONSULTATION MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-gold shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100">
              <h3 className="font-serif text-xl font-bold text-navy-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-gold-dark" />
                <span>Schedule First Consultation</span>
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-darkText/60 hover:text-navy-900 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-darkText mb-1">Select Wedding Lead / Enquiry *</label>
                <select
                  required
                  value={scheduleData.enquiryId}
                  onChange={(e) => setScheduleData({ ...scheduleData, enquiryId: e.target.value })}
                  className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                >
                  <option value="">-- Choose Client Lead --</option>
                  {enquiries.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.customerName} ({e.referenceNumber || 'Lead'}) — {e.location} ({e.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleData.scheduledAt}
                    onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
                    className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-darkText mb-1">Format *</label>
                  <select
                    value={scheduleData.meetingType}
                    onChange={(e) => setScheduleData({ ...scheduleData, meetingType: e.target.value })}
                    className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                  >
                    <option value="ONLINE_VIDEO">Virtual Google Meet</option>
                    <option value="IN_PERSON">In-Person Palace Lounge</option>
                  </select>
                </div>
              </div>

              {scheduleData.meetingType === 'ONLINE_VIDEO' ? (
                <div>
                  <label className="block font-semibold text-darkText mb-1">Video Meeting URL</label>
                  <input
                    type="url"
                    value={scheduleData.meetingLink}
                    onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-darkText mb-1">Palace Meeting Location</label>
                  <input
                    type="text"
                    value={scheduleData.meetingLocation}
                    onChange={(e) => setScheduleData({ ...scheduleData, meetingLocation: e.target.value })}
                    placeholder="e.g. Udaipur City Palace Concierge Lounge"
                    className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-darkText mb-1">Assign Senior Planner</label>
                <select
                  value={scheduleData.plannerId}
                  onChange={(e) => setScheduleData({ ...scheduleData, plannerId: e.target.value })}
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                >
                  <option value="">-- Choose Planner (Optional) --</option>
                  {planners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">Session Notes / Client Preparation</label>
                <textarea
                  rows={2}
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  placeholder="Review palace mandap aesthetics and budget constraints..."
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-navy-200 rounded-lg text-xs font-semibold text-darkText/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 bg-gold-gradient text-navy-950 font-bold rounded-lg text-xs shadow-gold-glow hover:brightness-105 disabled:opacity-50"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm & Dispatch Emails'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE CONSULTATION MODAL (RECORD VISION & REQUIREMENTS) */}
      {completingConsultation && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-4 border border-gold shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy-900 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-gold-dark" />
                  <span>Log Consultation Notes &amp; Couple Vision</span>
                </h3>
                <span className="text-xs text-darkText/60">
                  Client: {completingConsultation.enquiry?.customerName} (Ref: {completingConsultation.enquiry?.referenceNumber})
                </span>
              </div>
              <button onClick={() => setCompletingConsultation(null)} className="text-darkText/60 hover:text-navy-900 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Meeting Summary &amp; Key Discussion Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={completionData.meetingNotes}
                  onChange={(e) => setCompletionData({ ...completionData, meetingNotes: e.target.value })}
                  placeholder="Summary of discussion, family attendance, aesthetic direction..."
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">Couple&apos;s Wedding Vision</label>
                <textarea
                  rows={2}
                  value={completionData.coupleVision}
                  onChange={(e) => setCompletionData({ ...completionData, coupleVision: e.target.value })}
                  placeholder="Intimate royal heritage sunset union overlooking Lake Pichola with candle-lit royal banquet..."
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">Wedding Theme Preferences</label>
                  <input
                    type="text"
                    value={completionData.themePreferences}
                    onChange={(e) => setCompletionData({ ...completionData, themePreferences: e.target.value })}
                    placeholder="e.g. Imperial Rajputana / Royal Vintage"
                    className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-darkText mb-1">Confirmed Guest Count</label>
                  <input
                    type="number"
                    value={completionData.guestCountConfirmed}
                    onChange={(e) => setCompletionData({ ...completionData, guestCountConfirmed: e.target.value })}
                    placeholder="350"
                    className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">Discussed Total Budget (INR)</label>
                  <input
                    type="number"
                    value={completionData.budgetDiscussed}
                    onChange={(e) => setCompletionData({ ...completionData, budgetDiscussed: e.target.value })}
                    placeholder="2500000"
                    className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-darkText mb-1">Venue Preferences</label>
                  <input
                    type="text"
                    value={completionData.venuePreferences}
                    onChange={(e) => setCompletionData({ ...completionData, venuePreferences: e.target.value })}
                    placeholder="e.g. City Palace / Jagmandir"
                    className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">Family Expectations &amp; Special Requirements</label>
                <textarea
                  rows={2}
                  value={completionData.specialRequirements}
                  onChange={(e) => setCompletionData({ ...completionData, specialRequirements: e.target.value })}
                  placeholder="Pure vegetarian royal catering, live shehnai morning rituals, dedicated elder assistance..."
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setCompletingConsultation(null)}
                  className="px-4 py-2 border border-navy-200 rounded-lg text-xs font-semibold text-darkText/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCompletion}
                  className="px-5 py-2 bg-gold-gradient text-navy-950 font-bold rounded-lg text-xs shadow-gold-glow hover:brightness-105 disabled:opacity-50"
                >
                  {savingCompletion ? 'Saving...' : 'Mark Completed & Advance Lifecycle ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE CONSULTATION MODAL */}
      {reschedulingConsultation && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-gold shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy-100">
              <h3 className="font-serif text-lg font-bold text-navy-900">
                Reschedule Consultation
              </h3>
              <button onClick={() => setReschedulingConsultation(null)} className="text-darkText/60 hover:text-navy-900 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-darkText mb-1">New Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={rescheduleData.scheduledAt}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, scheduledAt: e.target.value })}
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">Updated Video Link / Venue</label>
                <input
                  type="text"
                  value={rescheduleData.meetingLink}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, meetingLink: e.target.value })}
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">Reschedule Reason</label>
                <input
                  type="text"
                  value={rescheduleData.rescheduleReason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, rescheduleReason: e.target.value })}
                  placeholder="Client travel schedule change"
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingConsultation(null)}
                  className="px-4 py-2 border border-navy-200 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReschedule}
                  className="px-5 py-2 bg-gold-gradient text-navy-950 font-bold rounded-lg text-xs shadow-gold-glow"
                >
                  {savingReschedule ? 'Rescheduling...' : 'Update & Notify Couple'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default function ConsultationsPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-darkText/60">Loading First Consultation Studio...</p>
      </div>
    }>
      <ConsultationsContent />
    </Suspense>
  );
}
