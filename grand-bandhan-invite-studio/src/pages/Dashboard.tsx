import React, { useState, useEffect } from 'react';
import { InvitationDraft, RsvpRecord } from '../types/invitation';
import {
  getAllDrafts,
  publishDraft,
  unpublishDraft,
  getRsvpsForSlug,
  fetchLiveRsvps,
  exportRsvpsCsv,
  getUserAccount,
  migrateLegacyDraftToAccount,
  checkCanPublish,
  UserAccount,
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
  Crown,
  QrCode,
  MessageSquare,
  Search,
  Filter,
  LogOut,
  User,
  Utensils,
} from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../locales';
import { AuthModal } from '../components/auth/AuthModal';
import { UpgradeModal } from '../components/subscription/UpgradeModal';
import { WhatsAppShareModal } from '../components/share/WhatsAppShareModal';
import { PrintableQrModal } from '../components/share/PrintableQrModal';

interface DashboardProps {
  onBackToStudio: () => void;
  onOpenDraft: (draft: InvitationDraft) => void;
  onCreateNew: () => void;
  onPreviewDraft?: (draft: InvitationDraft) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onBackToStudio,
  onOpenDraft,
  onCreateNew,
  onPreviewDraft,
}) => {
  const { lang, t } = useLanguage();
  const [drafts, setDrafts] = useState<InvitationDraft[]>(() => getAllDrafts());
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [selectedRsvpSlug, setSelectedRsvpSlug] = useState<string>(
    drafts[0]?.slug || 'kabir-meera-wedding'
  );
  const [activeTab, setActiveTab] = useState<'invites' | 'rsvps'>('invites');
  const [user, setUser] = useState<UserAccount>(() => getUserAccount());

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [whatsAppDraft, setWhatsAppDraft] = useState<InvitationDraft | null>(null);
  const [qrDraft, setQrDraft] = useState<InvitationDraft | null>(null);

  // RSVP filter & live sync state
  const [rsvps, setRsvps] = useState<RsvpRecord[]>(() => getRsvpsForSlug(selectedRsvpSlug));
  const [isSyncingRsvps, setIsSyncingRsvps] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'declined'>('all');

  // Load live RSVPs on slug change or tab switch
  useEffect(() => {
    let isMounted = true;
    const sync = async () => {
      setIsSyncingRsvps(true);
      const records = await fetchLiveRsvps(selectedRsvpSlug);
      if (isMounted) {
        setRsvps(records);
        setIsSyncingRsvps(false);
      }
    };
    sync();
    return () => {
      isMounted = false;
    };
  }, [selectedRsvpSlug, activeTab]);

  const handleManualSync = async () => {
    setIsSyncingRsvps(true);
    const records = await fetchLiveRsvps(selectedRsvpSlug);
    setRsvps(records);
    setIsSyncingRsvps(false);
  };

  // Detect whether an unmigrated legacy v1 draft exists in localStorage
  const hasLegacyDraft = (() => {
    try {
      const legacyRaw = localStorage.getItem('grand_bandhan_invite_draft_v1');
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        return parsed && parsed.id && !drafts.some((d) => d.id === parsed.id);
      }
    } catch {
      return false;
    }
    return false;
  })();

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
      // Check subscription tier limits
      const check = checkCanPublish(draft.id);
      if (!check.allowed) {
        setIsUpgradeModalOpen(true);
        return;
      }
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

  const currentEvent = drafts.find((d) => d.slug === selectedRsvpSlug);

  // Filtered RSVPs
  const filteredRsvps = rsvps.filter((r) => {
    const matchesSearch =
      r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.contact && r.contact.includes(searchQuery)) ||
      (r.dietaryOrNote && r.dietaryOrNote.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Dietary counts
  const jainCount = rsvps.filter((r) => r.status === 'attending' && /jain/i.test(r.dietaryOrNote || '')).length;
  const vegCount = rsvps.filter((r) => r.status === 'attending' && /veg/i.test(r.dietaryOrNote || '')).length;

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

        {/* User Account, Tier & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Account Profile Badge */}
          <div
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#e8decb] hover:border-[#c9a96a] cursor-pointer shadow-xs transition-all"
            title="Click to view or switch account"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6e1f2f] to-[#8a273c] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {user.name ? user.name[0] : 'H'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#2c2523] truncate max-w-[120px]">
                {user.name || 'Organizer'}
              </span>
              <span className="text-[10px] text-[#7c6f64] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{user.isLoggedIn ? 'Signed In' : 'Guest Mode'}</span>
              </span>
            </div>
          </div>

          {/* Tier Pill */}
          {user.tier === 'royal' ? (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#c9a96a]/20 to-[#d4af37]/30 border border-[#c9a96a] text-[#6e1f2f] text-xs font-bold shadow-xs">
              <Crown className="w-3.5 h-3.5 text-[#c9a96a]" />
              <span className="hidden md:inline">Royal Premium</span>
              <span className="md:hidden">Royal</span>
            </div>
          ) : (
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#f5ede0] border border-[#c9a96a]/50 text-[#8b7355] hover:text-[#6e1f2f] hover:border-[#6e1f2f] text-xs font-semibold transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c9a96a]" />
              <span className="hidden md:inline">Free Tier · Upgrade ⭐</span>
              <span className="md:hidden">Upgrade ⭐</span>
            </button>
          )}

          <LanguageSwitcher />

          <button
            onClick={onCreateNew}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#6e1f2f] text-[#dfba6a] text-xs font-bold shadow hover:bg-[#541421] transition-all"
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

        {/* Legacy Migration Alert Banner */}
        {hasLegacyDraft && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 font-sans">
                  {t.legacyDraftFound}
                </h4>
                <p className="text-[11px] text-amber-800 font-sans mt-0.5">
                  {t.legacyDraftFoundDesc}
                </p>
              </div>
            </div>
            <button
              onClick={handleMigrateLegacy}
              className="px-3.5 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition-all shrink-0"
            >
              {t.migrateDraft}
            </button>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e8decb] pb-2">
          <button
            onClick={() => setActiveTab('invites')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'invites'
                ? 'bg-[#6e1f2f] text-white shadow-xs'
                : 'text-stone-600 hover:bg-[#f2ede4]'
            }`}
          >
            {t.myInvitations} ({drafts.length})
          </button>
          <button
            onClick={() => setActiveTab('rsvps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'rsvps'
                ? 'bg-[#6e1f2f] text-white shadow-xs'
                : 'text-stone-600 hover:bg-[#f2ede4]'
            }`}
          >
            <span>Live Guest RSVPs ({totalRsvps})</span>
            {isSyncingRsvps && <RefreshCw className="w-3 h-3 animate-spin text-[#dfba6a]" />}
          </button>
        </div>

        {/* TAB 1: Invitations List */}
        {activeTab === 'invites' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {drafts.map((d) => {
                const draftRsvps = getRsvpsForSlug(d.slug);
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
                          {d.isPublished ? t.publishedLive : 'Draft (Unpublished)'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold font-heading text-[#2c2523] truncate">
                        {d.name || d.data.title}
                      </h3>
                      <p className="text-xs text-stone-500 font-sans mt-0.5">
                        {d.data.eventDateFormatted || 'No date set'}
                      </p>

                      {/* Slug & Links: Distinct behavior for published vs draft */}
                      <div className="my-3 p-2.5 bg-[#faf7f2] rounded-xl border border-[#e8decb] text-xs space-y-1">
                        {d.isPublished ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-emerald-800 font-mono font-semibold truncate max-w-[170px]">
                                /i/{d.slug}
                              </span>
                              <button
                                onClick={() => handleCopyLink(d.slug)}
                                className="flex items-center gap-1 text-[11px] font-bold text-[#6e1f2f] hover:underline"
                                title="Copy guest link"
                              >
                                {copiedSlug === d.slug ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-[#c99a3e]" />
                                    <span>Copy Link</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="text-[10px] text-stone-500 font-sans">
                              Public guest responses: <strong>{draftRsvps.length}</strong>
                            </div>
                          </>
                        ) : (
                          <div>
                            <span className="text-[11px] text-stone-700 font-semibold block">
                              Draft Preview Only
                            </span>
                            <span className="text-[10px] text-stone-500 font-sans block mt-0.5">
                              Publish to generate a shareable live guest link.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Social & Sharing Toolkit (WhatsApp & Print QR) */}
                    {d.isPublished && (
                      <div className="grid grid-cols-2 gap-2 my-2 pt-2 border-t border-[#f2ede4]">
                        <button
                          type="button"
                          onClick={() => setWhatsAppDraft(d)}
                          className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-[#25d366]/10 text-[#075e54] text-[11px] font-semibold border border-[#25d366]/30 hover:bg-[#25d366]/20 transition-all"
                          title="Share invitation on WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 text-[#25d366]" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrDraft(d)}
                          className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-[#c9a96a]/10 text-[#6e1f2f] text-[11px] font-semibold border border-[#c9a96a]/40 hover:bg-[#c9a96a]/20 transition-all"
                          title="Generate printable QR code"
                        >
                          <QrCode className="w-3 h-3 text-[#c9a96a]" />
                          <span>Print QR</span>
                        </button>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2 border-t border-[#f2ede4]">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onOpenDraft(d)}
                          className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-[#6e1f2f] text-white text-xs font-semibold hover:bg-[#541421] transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#dfba6a]" />
                          <span>Edit</span>
                        </button>

                        {d.isPublished ? (
                          <a
                            href={`/i/${d.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Live</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              onOpenDraft(d);
                              if (onPreviewDraft) {
                                onPreviewDraft(d);
                              } else {
                                window.location.hash = '#/preview';
                              }
                            }}
                            className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-stone-500" />
                            <span>Preview draft</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleTogglePublish(d)}
                        className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          d.isPublished
                            ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {d.isPublished ? t.unpublish : t.publish}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Guest Responses & RSVP Command Center */}
        {activeTab === 'rsvps' && (
          <div className="space-y-4">
            {/* Event Selector & Actions */}
            <div className="p-4 rounded-2xl bg-white border border-[#e8decb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Users className="w-5 h-5 text-[#6e1f2f] shrink-0" />
                <div className="w-full sm:w-auto">
                  <span className="text-xs font-bold text-[#2c2523] block">
                    Select Event:
                  </span>
                  <select
                    value={selectedRsvpSlug}
                    onChange={(e) => setSelectedRsvpSlug(e.target.value)}
                    className="mt-1 px-3 py-1.5 text-xs rounded-xl border border-[#e8decb] bg-white font-sans w-full sm:w-64 focus:ring-1 focus:ring-[#6e1f2f]"
                  >
                    {drafts.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name || d.data.title} {d.isPublished ? '(/i/' + d.slug + ')' : '(Draft)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleManualSync}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#e8decb] bg-white text-xs font-semibold text-[#7c6f64] hover:bg-[#f3ede2] transition-all"
                  title="Sync live responses from database"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRsvps ? 'animate-spin text-[#c9a96a]' : ''}`} />
                  <span className="hidden sm:inline">Refresh Sync</span>
                </button>

                {rsvps.length > 0 && (
                  <button
                    onClick={() => exportRsvpsCsv(selectedRsvpSlug, currentEvent?.name || 'Event')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6e1f2f] text-white text-xs font-semibold hover:bg-[#541421] transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4 text-[#dfba6a]" />
                    <span>{t.downloadCsv}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Attendance & Dietary Summary */}
            {rsvps.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-[#e8decb] text-center">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Total Confirmed Guests</span>
                  <span className="text-xl font-bold text-emerald-700">
                    {rsvps.filter((r) => r.status === 'attending').reduce((acc, r) => acc + (r.guestCount || 1), 0)}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#e8decb] text-center">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Declined / Regrets</span>
                  <span className="text-xl font-bold text-rose-700">
                    {rsvps.filter((r) => r.status === 'declined').length}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#e8decb] text-center">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Vegetarian Meals</span>
                  <span className="text-xl font-bold text-[#c99a3e]">{vegCount || 'All'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#e8decb] text-center">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Jain Meals</span>
                  <span className="text-xl font-bold text-amber-800">{jainCount}</span>
                </div>
              </div>
            )}

            {/* Search and Filter Toolbar */}
            {rsvps.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#e8decb]">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-[#a89984] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search guest name, notes, phone..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#faf7f2] border border-[#d5c7b3] rounded-lg focus:outline-none focus:border-[#6e1f2f]"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end text-xs">
                  <span className="text-stone-500 text-[11px] font-medium">Status:</span>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] ${statusFilter === 'all' ? 'bg-[#6e1f2f] text-white' : 'bg-stone-100 text-stone-600'}`}
                  >
                    All ({rsvps.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('attending')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] ${statusFilter === 'attending' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'}`}
                  >
                    Attending ({rsvps.filter((r) => r.status === 'attending').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('declined')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] ${statusFilter === 'declined' ? 'bg-rose-700 text-white' : 'bg-stone-100 text-stone-600'}`}
                  >
                    Declined ({rsvps.filter((r) => r.status === 'declined').length})
                  </button>
                </div>
              </div>
            )}

            {/* Responses Table or Publication-Dependent Empty State */}
            {filteredRsvps.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#e8decb]">
                <Clock className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                {currentEvent?.isPublished ? (
                  <>
                    <h4 className="text-sm font-bold text-stone-700">No RSVPs match your criteria</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Share your live guest link <code>/i/{selectedRsvpSlug}</code> with your attendees or send a WhatsApp invitation.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleCopyLink(selectedRsvpSlug)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#6e1f2f] text-[#dfba6a] text-xs font-bold inline-flex items-center gap-1.5 shadow"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Guest Link</span>
                      </button>
                      {currentEvent && (
                        <button
                          onClick={() => setWhatsAppDraft(currentEvent)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#25d366] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Share</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-sm font-bold text-amber-900">
                      This invitation is an unpublished draft
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Publish this invitation to generate an active public link and start collecting guest RSVP responses.
                    </p>
                    {currentEvent && (
                      <button
                        onClick={() => handleTogglePublish(currentEvent)}
                        className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow hover:bg-emerald-800"
                      >
                        <Send className="w-3.5 h-3.5 text-[#ffd166]" />
                        <span>Publish This Invitation</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#e8decb] overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf7f2] border-b border-[#e8decb] text-stone-600 font-cinzel text-[10px] uppercase">
                    <tr>
                      <th className="py-3 px-4">Guest Name</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Party Size</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Dietary / Notes</th>
                      <th className="py-3 px-4">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-sans">
                    {filteredRsvps.map((r) => (
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
      <footer className="max-w-6xl mx-auto w-full pt-6 border-t border-[#e8decb] text-center text-xs text-stone-500 font-sans flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} {BRAND_CONFIG.name} · {BRAND_CONFIG.tagline}</span>
        <span className="text-[11px] text-[#8b7355]">
          Host Plan: <strong>{user.tier === 'royal' ? 'Royal Premium VIP' : 'Free Starter Tier'}</strong>
        </span>
      </footer>

      {/* MODALS */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(updatedUser) => setUser(updatedUser)}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        user={user}
        onUpgraded={(updatedUser) => setUser(updatedUser)}
      />

      {whatsAppDraft && (
        <WhatsAppShareModal
          isOpen={!!whatsAppDraft}
          onClose={() => setWhatsAppDraft(null)}
          draft={whatsAppDraft}
        />
      )}

      {qrDraft && (
        <PrintableQrModal
          isOpen={!!qrDraft}
          onClose={() => setQrDraft(null)}
          draft={qrDraft}
        />
      )}
    </div>
  );
};
