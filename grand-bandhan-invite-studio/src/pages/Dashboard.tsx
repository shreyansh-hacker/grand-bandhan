import React, { useState } from 'react';
import { InvitationDraft, RsvpRecord } from '../types/invitation';
import {
  getAllDrafts,
  publishDraft,
  unpublishDraft,
  getRsvpsForSlug,
  exportRsvpsCsv,
  getUserAccount,
  migrateLegacyDraftToAccount,
} from '../services/storage';
import { BRAND_CONFIG } from '../config/brand';
import {
  ArrowLeft,
  Send,
  Eye,
  Edit3,
  Copy,
  Check,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../locales';

interface DashboardProps {
  onBackToStudio: () => void;
  onOpenDraft: (draft: InvitationDraft) => void;
  onCreateNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onBackToStudio,
  onOpenDraft,
  onCreateNew,
}) => {
  const { lang, t } = useLanguage();
  const [drafts, setDrafts] = useState<InvitationDraft[]>(() => getAllDrafts());
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [selectedRsvpSlug, setSelectedRsvpSlug] = useState<string>(
    drafts[0]?.slug || 'kabir-meera-wedding'
  );
  const [activeTab, setActiveTab] = useState<'invites' | 'rsvps'>('invites');

  const user = getUserAccount();

  // Metrics
  const totalDraftsCount = drafts.length;
  const publishedCount = drafts.filter((d) => d.isPublished).length;

  let totalRsvps = 0;
  let totalAttending = 0;
  let totalDeclined = 0;

  drafts.forEach((d) => {
    const records = getRsvpsForSlug(d.slug);
    totalRsvps += records.length;
    records.forEach((r) => {
      if (r.status === 'attending') {
        totalAttending += r.guestCount || 1;
      } else {
        totalDeclined += 1;
      }
    });
  });

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/i/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleTogglePublish = (draft: InvitationDraft) => {
    if (draft.isPublished) {
      if (window.confirm(t.confirmUnpublishTitle)) {
        unpublishDraft(draft.id);
        setDrafts([...getAllDrafts()]);
      }
    } else {
      publishDraft(draft);
      setDrafts([...getAllDrafts()]);
    }
  };

  const handleMigrateLegacy = () => {
    const migrated = migrateLegacyDraftToAccount(user.email);
    setDrafts([...getAllDrafts()]);
    alert('Legacy browser draft imported successfully into your account!');
    onOpenDraft(migrated);
  };

  const currentRsvps: RsvpRecord[] = getRsvpsForSlug(selectedRsvpSlug);
  const currentEvent = drafts.find((d) => d.slug === selectedRsvpSlug);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between pb-5 border-b border-[#e8decb]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e8decb] text-xs font-semibold text-[#6e1f2f] hover:bg-[#f2ede4] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Studio</span>
          </button>
          <img
            src={BRAND_CONFIG.logoUrl}
            alt="Grand Bandhan Logo"
            className="h-8 sm:h-10 w-auto object-contain hidden xs:block"
          />
        </div>

        {/* User Badge & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#e8decb] text-xs text-stone-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium">{user.email}</span>
          </div>

          <LanguageSwitcher />

          <button
            onClick={onCreateNew}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6e1f2f] text-[#dfba6a] text-xs font-bold shadow hover:bg-[#541421] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.createNew}</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <main className="max-w-6xl mx-auto w-full flex-1 py-6 sm:py-8 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#e8decb] shadow-xs">
            <span className="text-[11px] font-cinzel uppercase text-stone-500 font-bold block">
              {t.draftsCount}
            </span>
            <span className="text-2xl font-bold font-heading text-[#6e1f2f]">
              {totalDraftsCount}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#e8decb] shadow-xs">
            <span className="text-[11px] font-cinzel uppercase text-stone-500 font-bold block">
              {t.publishedCount}
            </span>
            <span className="text-2xl font-bold font-heading text-emerald-700">
              {publishedCount}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#e8decb] shadow-xs">
            <span className="text-[11px] font-cinzel uppercase text-stone-500 font-bold block">
              {t.attendingCount}
            </span>
            <span className="text-2xl font-bold font-heading text-[#c99a3e]">
              {totalAttending}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#e8decb] shadow-xs">
            <span className="text-[11px] font-cinzel uppercase text-stone-500 font-bold block">
              {t.totalRsvps}
            </span>
            <span className="text-2xl font-bold font-heading text-stone-800">
              {totalRsvps}
            </span>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e8decb] pb-2">
          <button
            onClick={() => setActiveTab('invites')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'invites'
                ? 'bg-[#6e1f2f] text-white shadow-xs'
                : 'text-stone-600 hover:bg-[#f2ede4]'
            }`}
          >
            {t.myInvitations} ({drafts.length})
          </button>
          <button
            onClick={() => setActiveTab('rsvps')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rsvps'
                ? 'bg-[#6e1f2f] text-white shadow-xs'
                : 'text-stone-600 hover:bg-[#f2ede4]'
            }`}
          >
            Guest Responses ({totalRsvps})
          </button>
        </div>

        {/* TAB 1: Invitations List */}
        {activeTab === 'invites' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {drafts.map((d) => {
                const rsvps = getRsvpsForSlug(d.slug);
                return (
                  <div
                    key={d.id}
                    className="p-5 rounded-2xl bg-white border border-[#e8decb] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-cinzel uppercase tracking-wider bg-[#faf7f2] text-[#852b3d] border border-[#dfba6a]/40">
                          {d.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.isPublished ? t.publishedLive : 'Draft'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold font-heading text-[#2c2523] truncate">
                        {d.name || d.data.title}
                      </h3>
                      <p className="text-xs text-stone-500 font-sans mt-0.5">
                        {d.data.eventDateFormatted || 'No date set'}
                      </p>

                      {/* Slug & Links */}
                      <div className="my-3 p-2 bg-[#faf7f2] rounded-lg border border-[#e8decb] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-stone-500 font-mono truncate max-w-[170px]">
                            /i/{d.slug}
                          </span>
                          <button
                            onClick={() => handleCopyLink(d.slug)}
                            className="p-1 text-[#6e1f2f] hover:bg-[#f2ede4] rounded"
                            title={t.copyLink}
                          >
                            {copiedSlug === d.slug ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[#c99a3e]" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-stone-600 font-sans">
                          Responses: <strong>{rsvps.length}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-3 border-t border-[#f2ede4]">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onOpenDraft(d)}
                          className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-[#6e1f2f] text-white text-xs font-semibold hover:bg-[#541421] transition-all"
                        >
                          <Edit3 className="w-3 h-3 text-[#dfba6a]" />
                          <span>Edit</span>
                        </button>
                        <a
                          href={`/i/${d.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View</span>
                        </a>
                      </div>

                      <button
                        onClick={() => handleTogglePublish(d)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                          d.isPublished
                            ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                            : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        {d.isPublished ? t.unpublish : t.publish}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Migrate Legacy Draft Banner */}
            <div className="p-4 rounded-xl bg-white border border-dashed border-[#c99a3e] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[#6e1f2f] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#c99a3e]" />
                  <span>Legacy Draft Recovery &amp; Migration</span>
                </h4>
                <p className="text-[11px] text-stone-600 font-sans mt-0.5">
                  Have an older draft saved in your browser from Milestone 1? Import it into your active projects list safely without overwriting.
                </p>
              </div>
              <button
                onClick={handleMigrateLegacy}
                className="px-3 py-1.5 rounded-lg bg-[#faf7f2] border border-[#dfba6a] text-[#6e1f2f] text-xs font-semibold hover:bg-[#f2ede4] transition-all"
              >
                {t.migrateLocalDraft}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Guest Responses & RSVP Analytics */}
        {activeTab === 'rsvps' && (
          <div className="space-y-4">
            {/* Event Selector for RSVPs */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e8decb]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6e1f2f]" />
                <div>
                  <span className="text-xs font-bold text-[#2c2523] block">
                    Select Event:
                  </span>
                  <select
                    value={selectedRsvpSlug}
                    onChange={(e) => setSelectedRsvpSlug(e.target.value)}
                    className="mt-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold bg-white outline-none"
                  >
                    {drafts.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name || d.data.title} (/i/{d.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentRsvps.length > 0 && (
                <button
                  onClick={() => exportRsvpsCsv(selectedRsvpSlug, currentEvent?.name || 'Event')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#6e1f2f] text-white text-xs font-semibold hover:bg-[#541421] transition-all"
                >
                  <Download className="w-4 h-4 text-[#dfba6a]" />
                  <span>{t.downloadCsv}</span>
                </button>
              )}
            </div>

            {/* Responses Table */}
            {currentRsvps.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#e8decb]">
                <Clock className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                <h4 className="text-sm font-bold text-stone-700">No RSVPs received yet</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Share your link <code>/i/{selectedRsvpSlug}</code> with guests to collect responses.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#e8decb] overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf7f2] border-b border-[#e8decb] text-stone-600 font-cinzel text-[10px] uppercase">
                    <tr>
                      <th className="py-3 px-4">Guest Name</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Party Size</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Notes / Wishes</th>
                      <th className="py-3 px-4">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-sans">
                    {currentRsvps.map((r) => (
                      <tr key={r.id} className="hover:bg-stone-50/70">
                        <td className="py-3 px-4 font-semibold text-[#2c2523]">{r.guestName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'attending'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status === 'attending' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{r.status === 'attending' ? 'Attending' : 'Declined'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-800">{r.guestCount}</td>
                        <td className="py-3 px-4 text-stone-600">{r.contact || '-'}</td>
                        <td className="py-3 px-4 text-stone-600 italic">{r.dietaryOrNote || '-'}</td>
                        <td className="py-3 px-4 text-stone-400 text-[10px]">
                          {new Date(r.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-6 border-t border-[#e8decb] text-center text-xs text-[#7d6a58] font-sans">
        <p>Grand Bandhan Invite Studio · Secure Organizer Dashboard</p>
      </footer>
    </div>
  );
};
