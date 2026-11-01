'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Crown,
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  PenTool,
  RotateCcw,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Printer,
  CreditCard,
  FileCheck,
  Phone,
  Mail,
  Utensils,
  Hotel,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { AgreementStatus, VerificationResponse, RsvpStatus, PlanningForSide } from '@grand-bandhan/shared';

export default function ClientPortalPage() {
  const params = useParams();
  const token = params?.token as string;

  const [wedding, setWedding] = useState<any | null>(null);
  const [agreement, setAgreement] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RSVP' | 'PAYMENTS' | 'AGREEMENT' | 'SCHEDULE'>('OVERVIEW');

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signing, setSigning] = useState(false);

  // Guest Management
  const [guestFilter, setGuestFilter] = useState<'ALL' | 'ATTENDING' | 'PENDING' | 'DECLINED'>('ALL');
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    fullName: '',
    email: '',
    phone: '',
    side: 'BRIDE_SIDE',
    rsvpStatus: 'ATTENDING',
    guestCount: 1,
    dietaryPreference: 'Pure Vegetarian',
    roomAssigned: '',
    notes: '',
  });
  const [savingGuest, setSavingGuest] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      let targetWeddingId = token;

      // If token not provided in route, find from API or user context
      if (!targetWeddingId || targetWeddingId === 'current') {
        const wRes = await apiRequest('/api/weddings');
        if (wRes.success && wRes.data && wRes.data.length > 0) {
          targetWeddingId = wRes.data[0].id;
        }
      }

      if (targetWeddingId) {
        // Fetch detailed portal info
        const detailsRes = await apiRequest(`/api/weddings/${targetWeddingId}/portal-details`);
        if (detailsRes.success && detailsRes.data) {
          const w = detailsRes.data.wedding;
          setWedding(w);
          setAgreement(w.agreement || null);
          setEvents(w.events || []);
          setPayments(w.payments || []);
          setGuests(w.guests || []);
        } else {
          // Fallback to legacy endpoints if portal-details fails
          const wRes = await apiRequest('/api/weddings');
          if (wRes.success && wRes.data && wRes.data.length > 0) {
            const w = wRes.data[0];
            setWedding(w);
            const aRes = await apiRequest(`/api/agreements/${w.id}`);
            if (aRes.success) setAgreement(aRes.data);
            const gRes = await apiRequest(`/api/weddings/${w.id}/guests`);
            if (gRes.success) setGuests(gRes.data);
          }
        }

        // Fetch verifications
        const vRes = await apiRequest(`/api/verifications?weddingId=${targetWeddingId}`);
        if (vRes.success && vRes.data) {
          setVerifications(vRes.data);
        }
      }
    } catch (e) {
      console.error('Client Portal load error:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  // Canvas Drawing Handlers
  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0A2540';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function handleSignAgreement(e: React.FormEvent) {
    e.preventDefault();
    if (!wedding || !canvasRef.current) return;

    const signatureDataUrl = canvasRef.current.toDataURL('image/png');
    if (!signatureDataUrl || signatureDataUrl.length < 100) {
      alert('Please draw your digital signature on the signature pad.');
      return;
    }

    setSigning(true);
    try {
      const res = await apiRequest(`/api/agreements/${wedding.id}/sign`, {
        method: 'POST',
        body: JSON.stringify({
          signedByName: signerName,
          signatureDataUrl,
          acceptedTerms: true,
        }),
      });

      if (res.success) {
        alert('Digital Agreement legally signed and verified!');
        setAgreement(res.data);
      } else {
        alert(res.message || 'Signing failed');
      }
    } catch (e: any) {
      alert(e.message || 'Error signing agreement');
    } finally {
      setSigning(false);
    }
  }

  async function handleConfirmService(verificationId: string, responseType: VerificationResponse) {
    try {
      const res = await apiRequest(`/api/verifications/${verificationId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response: responseType, evidencePhotos: [] }),
      });
      if (res.success) {
        alert(res.message);
        if (wedding) {
          const vRes = await apiRequest(`/api/verifications?weddingId=${wedding.id}`);
          if (vRes.success) setVerifications(vRes.data);
        }
      }
    } catch (e: any) {
      alert(e.message || 'Error confirming');
    }
  }

  // RSVP Management Handlers
  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!wedding) return;
    setSavingGuest(true);

    try {
      const res = await apiRequest(`/api/weddings/${wedding.id}/guests`, {
        method: 'POST',
        body: JSON.stringify(newGuest),
      });

      if (res.success) {
        setGuests((prev) => [res.data, ...prev]);
        setShowAddGuestModal(false);
        setNewGuest({
          fullName: '',
          email: '',
          phone: '',
          side: 'BRIDE_SIDE',
          rsvpStatus: 'ATTENDING',
          guestCount: 1,
          dietaryPreference: 'Pure Vegetarian',
          roomAssigned: '',
          notes: '',
        });
      } else {
        alert(res.message || 'Failed to add guest');
      }
    } catch (e: any) {
      alert(e.message || 'Error saving guest');
    } finally {
      setSavingGuest(false);
    }
  }

  async function handleUpdateRsvpStatus(guestId: string, newStatus: string) {
    try {
      const res = await apiRequest(`/api/weddings/${wedding.id}/guests/${guestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ rsvpStatus: newStatus }),
      });

      if (res.success) {
        setGuests((prev) =>
          prev.map((g) => (g.id === guestId ? { ...g, rsvpStatus: newStatus } : g))
        );
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update RSVP');
    }
  }

  async function handleDeleteGuest(guestId: string) {
    if (!confirm('Are you sure you want to remove this guest from the invitation list?')) return;
    try {
      const res = await apiRequest(`/api/weddings/${wedding.id}/guests/${guestId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setGuests((prev) => prev.filter((g) => g.id !== guestId));
      }
    } catch (e: any) {
      alert(e.message || 'Failed to delete guest');
    }
  }

  // Countdown Calculation
  const daysUntilWedding = wedding
    ? Math.max(0, Math.ceil((new Date(wedding.weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // RSVP Statistics
  const totalInvited = guests.reduce((sum, g) => sum + (g.guestCount || 1), 0);
  const attendingGuests = guests.filter((g) => g.rsvpStatus === 'ATTENDING').reduce((sum, g) => sum + (g.guestCount || 1), 0);
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'DECLINED').reduce((sum, g) => sum + (g.guestCount || 1), 0);
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'PENDING').reduce((sum, g) => sum + (g.guestCount || 1), 0);

  const filteredGuests = guests.filter((g) => {
    if (guestFilter === 'ALL') return true;
    return g.rsvpStatus === guestFilter;
  });

  const isAlreadySigned = agreement?.status === AgreementStatus.SIGNED;

  return (
    <div className="min-h-screen bg-cream text-darkText font-sans print:bg-white">
      {/* Imperial Portal Header */}
      <header className="bg-navy-900 text-white p-6 border-b border-gold/40 shadow-navy-deep print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gold-gradient p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-gold" />
              </div>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold text-gold-gradient tracking-wide">
                GRAND BANDHAN
              </span>
              <span className="block text-[11px] text-cream-300 uppercase tracking-widest font-semibold">
                Royal Couple &amp; Client Privileged Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 text-gold border border-gold/30 rounded-lg text-xs font-semibold hover:bg-navy-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Itinerary</span>
            </button>
            <span className="text-xs bg-gold/15 text-gold border border-gold/30 px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Privileged VIP Access</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
        {/* Royal Couple Banner */}
        <div className="bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-3 py-1 rounded-full inline-block mb-2">
                {wedding?.weddingCode || 'GB-ROYAL'}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 leading-tight">
                {wedding?.brideName || 'Bride'} <span className="text-gold font-normal">&amp;</span> {wedding?.groomName || 'Groom'}
              </h1>
              <p className="text-xs sm:text-sm text-darkText/70 mt-1 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gold-dark" />
                  <strong>{wedding?.location || 'Rajasthan Palace'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gold-dark" />
                  <span>{wedding?.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Confirmed Date'}</span>
                </span>
                <span>•</span>
                <span className="text-royal font-semibold">Package: {wedding?.packageType || 'Full-Service Royal'}</span>
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="bg-navy-950 text-white p-4 rounded-xl border border-gold/40 text-center sm:min-w-[140px] shadow-sm">
              <span className="text-3xl font-serif font-bold text-gold block leading-none">
                {daysUntilWedding}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-cream-300 font-semibold mt-1 block">
                Days to Royal Union
              </span>
            </div>
          </div>

          {/* Lead Planner Contact Strip */}
          {wedding?.planner && (
            <div className="pt-4 border-t border-navy-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-cream-50 p-3 rounded-xl border border-navy-200/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center font-bold text-navy-900">
                  {wedding.planner.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-darkText/70 block text-[10px] uppercase font-bold">Your Dedicated Lead Planner</span>
                  <span className="font-bold text-navy-900">{wedding.planner.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-darkText/80">
                {wedding.planner.phone && (
                  <span className="flex items-center gap-1 text-royal font-semibold">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{wedding.planner.phone}</span>
                  </span>
                )}
                {wedding.planner.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-navy-500" />
                    <span>{wedding.planner.email}</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-navy-200 pb-2 print:hidden">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-navy-900 text-gold shadow-sm'
                : 'text-darkText/70 hover:bg-cream-100'
            }`}
          >
            🏰 Royal Overview
          </button>
          <button
            onClick={() => setActiveTab('RSVP')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'RSVP'
                ? 'bg-navy-900 text-gold shadow-sm'
                : 'text-darkText/70 hover:bg-cream-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Guest List &amp; Digital RSVP ({guests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'PAYMENTS'
                ? 'bg-navy-900 text-gold shadow-sm'
                : 'text-darkText/70 hover:bg-cream-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Milestone Payments &amp; Receipts</span>
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SCHEDULE'
                ? 'bg-navy-900 text-gold shadow-sm'
                : 'text-darkText/70 hover:bg-cream-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Ceremony Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab('AGREEMENT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'AGREEMENT'
                ? 'bg-navy-900 text-gold shadow-sm'
                : 'text-darkText/70 hover:bg-cream-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Legal Agreement {isAlreadySigned && '✓'}</span>
          </button>
        </div>

        {/* TAB 1: ROYAL OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Quick KPI Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-gold/40 rounded-xl p-4 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-darkText/70 block">
                  Capacity Target
                </span>
                <span className="text-2xl font-serif font-bold text-navy-900 mt-1 block">
                  {wedding?.guestCount || 350}
                </span>
                <span className="text-[11px] text-royal font-semibold">Imperial Guests</span>
              </div>

              <div className="bg-white border border-green-300 rounded-xl p-4 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 block">
                  Confirmed RSVPs
                </span>
                <span className="text-2xl font-serif font-bold text-green-800 mt-1 block">
                  {attendingGuests}
                </span>
                <span className="text-[11px] text-green-700 font-semibold">Attending Union</span>
              </div>

              <div className="bg-white border border-amber-300 rounded-xl p-4 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  Pending Invites
                </span>
                <span className="text-2xl font-serif font-bold text-amber-800 mt-1 block">
                  {pendingGuests}
                </span>
                <span className="text-[11px] text-amber-700 font-semibold">Awaiting Response</span>
              </div>

              <div className="bg-white border border-gold/40 rounded-xl p-4 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block">
                  Agreement Status
                </span>
                <span className="text-lg font-bold text-navy-900 mt-1 block truncate">
                  {isAlreadySigned ? '✓ Legally Executed' : 'Pending Signature'}
                </span>
                <button
                  onClick={() => setActiveTab('AGREEMENT')}
                  className="text-[11px] text-royal hover:underline font-semibold"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>

            {/* Live Service Verification Requests (e.g. Mandap, DJ Setup) */}
            {verifications.length > 0 && (
              <div className="bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-royal">
                  Wedding-Day Live Service Verification
                </span>
                <h3 className="font-serif text-xl font-bold text-navy-900">
                  Confirm Delivered Vendor Services
                </h3>

                {verifications.map((v) => (
                  <div key={v.id} className="p-4 bg-cream-100 border border-gold/30 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-navy-900 text-sm">{v.serviceName}</span>
                      <span className="font-bold uppercase text-gold-dark">{v.status.replace(/_/g, ' ')}</span>
                    </div>

                    <p className="text-darkText/80">
                      Has this service been delivered to your royal satisfaction?
                    </p>

                    {v.status === 'AWAITING_CONFIRMATION' && (
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => handleConfirmService(v.id, VerificationResponse.COMPLETED)}
                          className="px-4 py-2 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800"
                        >
                          Yes, Completed ✓
                        </button>
                        <button
                          onClick={() => handleConfirmService(v.id, VerificationResponse.ISSUE_REPORTED)}
                          className="px-4 py-2 bg-navy-900 text-gold border border-gold font-bold rounded-lg hover:bg-navy-800"
                        >
                          Report an Issue
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GUEST LIST & DIGITAL RSVP */}
        {activeTab === 'RSVP' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900">
                  Guest Roster &amp; Digital RSVP Tracking
                </h3>
                <p className="text-xs text-darkText/70">
                  Manage confirmed attendance, side allocations, room suites, and dietary requirements.
                </p>
              </div>

              <button
                onClick={() => setShowAddGuestModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gold-gradient text-navy-950 font-bold rounded-xl text-xs shadow-gold-glow hover:brightness-105 transition-all self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Add Royal Guest</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 text-xs">
              {(['ALL', 'ATTENDING', 'PENDING', 'DECLINED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setGuestFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    guestFilter === filter
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'bg-white border border-navy-200 text-darkText/70 hover:bg-cream-100'
                  }`}
                >
                  {filter} ({filter === 'ALL' ? guests.length : guests.filter((g) => g.rsvpStatus === filter).length})
                </button>
              ))}
            </div>

            {/* Guests Table */}
            <div className="bg-white border-2 border-gold/40 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-900 text-white uppercase text-[10px] tracking-wider font-semibold border-b border-gold/30">
                    <tr>
                      <th className="p-3.5">Guest Name</th>
                      <th className="p-3.5">Side</th>
                      <th className="p-3.5">Party Size</th>
                      <th className="p-3.5">Dietary Note</th>
                      <th className="p-3.5">Room Suite</th>
                      <th className="p-3.5">RSVP Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {filteredGuests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-darkText/60">
                          No guests match the selected filter. Click <strong>Add Royal Guest</strong> to register party members.
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((g) => (
                        <tr key={g.id} className="hover:bg-cream-50 transition-colors">
                          <td className="p-3.5 font-bold text-navy-900">
                            <div>{g.fullName}</div>
                            {(g.phone || g.email) && (
                              <div className="text-[10px] text-darkText/60 font-normal">
                                {g.phone} {g.email && `• ${g.email}`}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="text-[10px] uppercase font-bold text-navy-700 bg-cream-200 px-2 py-0.5 rounded">
                              {g.side.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="p-3.5 font-semibold text-navy-900">
                            {g.guestCount} {g.guestCount > 1 ? 'Guests' : 'Guest'}
                          </td>
                          <td className="p-3.5 text-darkText/80">
                            {g.dietaryPreference || 'Standard'}
                          </td>
                          <td className="p-3.5 text-darkText/80">
                            {g.roomAssigned || '—'}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateRsvpStatus(g.id, 'ATTENDING')}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  g.rsvpStatus === 'ATTENDING'
                                    ? 'bg-green-700 text-white'
                                    : 'bg-green-50 text-green-800 hover:bg-green-100'
                                }`}
                              >
                                Attending
                              </button>
                              <button
                                onClick={() => handleUpdateRsvpStatus(g.id, 'DECLINED')}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  g.rsvpStatus === 'DECLINED'
                                    ? 'bg-red-700 text-white'
                                    : 'bg-red-50 text-red-800 hover:bg-red-100'
                                }`}
                              >
                                Declined
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleDeleteGuest(g.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              title="Delete Guest"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Guest Modal */}
            {showAddGuestModal && (
              <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-gold/40 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-navy-100">
                    <h4 className="font-serif text-xl font-bold text-navy-900">Add Royal Guest</h4>
                    <button
                      onClick={() => setShowAddGuestModal(false)}
                      className="text-darkText/60 hover:text-darkText text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddGuest} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Full Guest Name *</label>
                      <input
                        type="text"
                        required
                        value={newGuest.fullName}
                        onChange={(e) => setNewGuest({ ...newGuest, fullName: e.target.value })}
                        placeholder="e.g. Maharaja Vikramaditya Rathore"
                        className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Side / Clan</label>
                        <select
                          value={newGuest.side}
                          onChange={(e) => setNewGuest({ ...newGuest, side: e.target.value })}
                          className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                        >
                          <option value="BRIDE_SIDE">Bride Side</option>
                          <option value="GROOM_SIDE">Groom Side</option>
                          <option value="NOT_SPECIFIED">VIP Guest</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Party Count</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={newGuest.guestCount}
                          onChange={(e) => setNewGuest({ ...newGuest, guestCount: Number(e.target.value) })}
                          className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={newGuest.phone}
                          onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Email Address</label>
                        <input
                          type="email"
                          value={newGuest.email}
                          onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                          placeholder="guest@domain.com"
                          className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Dietary Preference</label>
                      <select
                        value={newGuest.dietaryPreference}
                        onChange={(e) => setNewGuest({ ...newGuest, dietaryPreference: e.target.value })}
                        className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                      >
                        <option value="Pure Vegetarian">Pure Vegetarian</option>
                        <option value="Jain Special (No Root Veg)">Jain Special (No Root Veg)</option>
                        <option value="Non-Vegetarian Awadhi/Mughlai">Non-Vegetarian Awadhi/Mughlai</option>
                        <option value="Vegan / Gluten Free">Vegan / Gluten Free</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Palace Suite / Room Assignment</label>
                      <input
                        type="text"
                        value={newGuest.roomAssigned}
                        onChange={(e) => setNewGuest({ ...newGuest, roomAssigned: e.target.value })}
                        placeholder="e.g. Mewar Wing - Room 302"
                        className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddGuestModal(false)}
                        className="px-4 py-2 border border-navy-200 rounded-lg font-semibold hover:bg-cream-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingGuest}
                        className="px-5 py-2 bg-gold-gradient text-navy-950 font-bold rounded-lg shadow-gold-glow hover:brightness-105 disabled:opacity-50"
                      >
                        {savingGuest ? 'Adding...' : 'Save Guest'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MILESTONE PAYMENTS & RECEIPTS */}
        {activeTab === 'PAYMENTS' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-navy-900">
                Payment Schedule &amp; Financial Ledger
              </h3>
              <p className="text-xs text-darkText/70">
                Transparent escrow disbursements: 25% booking deposit, 50% advance, 25% post-wedding settlement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {payments.length === 0 ? (
                <div className="col-span-3 p-8 bg-white border border-navy-200 rounded-2xl text-center text-xs text-darkText/70">
                  Payment schedules are being configured by your lead planner.
                </div>
              ) : (
                payments.map((p, idx) => {
                  const isPaid = p.status === 'PAID';
                  return (
                    <div
                      key={p.id || idx}
                      className={`bg-white border-2 rounded-2xl p-6 shadow-sm space-y-4 ${
                        isPaid ? 'border-green-300 bg-green-50/20' : 'border-gold/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-royal bg-royal/10 px-2 py-0.5 rounded">
                          Milestone {idx + 1}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-green-100 text-green-900 border border-green-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-serif text-lg font-bold text-navy-900">
                          {p.milestoneName?.replace(/_/g, ' ') || 'Milestone Payment'}
                        </h4>
                        <span className="text-2xl font-serif font-bold text-gold-dark mt-1 block">
                          ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-xs text-darkText/70 space-y-1 pt-2 border-t border-navy-100">
                        <div>
                          Due Date: <strong>{new Date(p.dueDate).toLocaleDateString('en-IN')}</strong>
                        </div>
                        {p.transactionRef && (
                          <div className="font-mono text-[11px] text-green-800">
                            Ref: {p.transactionRef}
                          </div>
                        )}
                        {p.notes && <div className="text-[11px] italic">{p.notes}</div>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CEREMONY SCHEDULE */}
        {activeTab === 'SCHEDULE' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-navy-900">
                Master Ceremony Timeline
              </h3>
              <p className="text-xs text-darkText/70">
                Synchronized palace events coordinated with decor teams, sound engineers, and royal caterers.
              </p>
            </div>

            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="p-8 bg-white border border-navy-200 rounded-2xl text-center text-xs text-darkText/70">
                  Your event itinerary is being finalized by your lead planner.
                </div>
              ) : (
                events.map((evt, idx) => (
                  <div
                    key={evt.id || idx}
                    className="bg-white border-2 border-gold/40 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2 py-0.5 rounded">
                          Ceremony {idx + 1}
                        </span>
                        <h4 className="font-serif text-xl font-bold text-navy-900">
                          {evt.title}
                        </h4>
                      </div>
                      <div className="text-xs text-darkText/70 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gold-dark" />
                          <span>
                            {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                          <span>{evt.location}</span>
                        </span>
                      </div>
                      {evt.notes && <p className="text-xs text-darkText/80 pt-1">{evt.notes}</p>}
                    </div>

                    <span className="px-3 py-1 bg-green-50 text-green-900 border border-green-300 font-bold text-xs rounded-full self-start sm:self-auto">
                      {evt.status || 'SCHEDULED'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: DIGITAL LEGAL AGREEMENT */}
        {activeTab === 'AGREEMENT' && (
          <div className="bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-navy-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-royal">
                  Legal Service Agreement
                </span>
                <h3 className="font-serif text-2xl font-bold text-navy-900 mt-0.5">
                  Digital Terms &amp; Conditions of Service
                </h3>
              </div>

              {isAlreadySigned ? (
                <span className="px-3 py-1 bg-green-100 text-green-900 border border-green-300 font-bold text-xs rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  <span>Legally Signed</span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-full">
                  Pending Signature
                </span>
              )}
            </div>

            {/* Terms Preview Box */}
            <div className="bg-cream-100 p-4 rounded-xl border border-navy-200/80 text-xs font-mono text-darkText/80 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
              {agreement?.termsContent || 'Loading terms of service...'}
            </div>

            {isAlreadySigned ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-green-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-700" />
                  <span>Digitally Executed by: {agreement.signedByName}</span>
                </div>
                <p className="text-green-800">
                  Signed on: {new Date(agreement.signedAt).toLocaleString()} | Client IP: {agreement.clientIp || 'Verified'}
                </p>
                {agreement.signatureDataUrl && (
                  <div className="pt-2">
                    <span className="text-[10px] text-green-800 font-bold block mb-1">Audit Signature Record:</span>
                    <img
                      src={agreement.signatureDataUrl}
                      alt="Digital Signature"
                      className="h-14 border border-green-300 bg-white p-1 rounded"
                    />
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSignAgreement} className="space-y-4 pt-2 text-xs">
                <div>
                  <label className="block font-semibold text-darkText mb-1">
                    Full Legal Signer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="e.g. Siddharth Malhotra"
                    className="w-full p-2.5 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                  />
                </div>

                {/* Digital Signature Drawing Canvas */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-darkText flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-gold-dark" />
                      <span>Draw Your Digital Signature on Canvas * (Typed names not accepted)</span>
                    </label>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-royal hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear Canvas</span>
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-gold/60 rounded-xl overflow-hidden bg-white">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-36 cursor-crosshair touch-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    required
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="accent-gold w-4 h-4"
                  />
                  <label htmlFor="acceptTerms" className="text-darkText font-medium">
                    I have read and agree to the Grand Bandhan Terms of Service and acknowledge that this digital signature is legally binding.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={signing}
                  className="w-full py-3 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all disabled:opacity-50"
                >
                  {signing ? 'Verifying & Executing Agreement...' : 'Execute & Legally Sign Agreement'}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
