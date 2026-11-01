'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileSpreadsheet,
  CheckCircle2,
  Crown,
  Award,
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
  X,
  FileText,
  ShieldCheck,
  ChevronRight,
  Filter,
  Search,
  Building,
  Star,
  Sparkles,
  RefreshCw,
  MapPin,
  Users,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { QuotationRequestStatus, QuotationStatus, VendorCategory } from '@grand-bandhan/shared';

function QuotationsContent() {
  const searchParams = useSearchParams();
  const initialWeddingId = searchParams.get('weddingId') || '';

  const [weddings, setWeddings] = useState<any[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>(initialWeddingId);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [awardingId, setAwardingId] = useState<string | null>(null);

  // Modals
  const [isRfpModalOpen, setIsRfpModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [creatingRfp, setCreatingRfp] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);

  // Form: Create RFP
  const [rfpForm, setRfpForm] = useState({
    weddingId: '',
    category: VendorCategory.CATERING,
    title: '',
    guestCount: 400,
    targetBudget: 2500000,
    specifications: '',
    invitedVendorIds: [] as string[],
  });

  // Form: Record Bid
  const [bidForm, setBidForm] = useState({
    vendorId: '',
    baseAmount: 650000,
    pricePerPlate: 1850,
    extraHourRate: 25000,
    additionalCosts: 30000,
    menuDetails: 'Royal Rajasthani & Continental Gourmet Buffet with live counters',
    includedItems: 'Live Chaat Counter, Passed Hors d\'oeuvres, Copper Chafing Dishes, Royal Butler Service',
    notes: 'Premium banquet setup with heritage brass silverware and customized spice levels.',
    isAgencyRecommended: false,
  });

  // Sync initial weddingId from URL if changed
  useEffect(() => {
    if (initialWeddingId && initialWeddingId !== selectedWeddingId) {
      setSelectedWeddingId(initialWeddingId);
    }
  }, [initialWeddingId]);

  // Load weddings and vendors on initial mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [wRes, vRes] = await Promise.all([
          apiRequest('/api/weddings'),
          apiRequest('/api/vendors'),
        ]);

        if (wRes.success && wRes.data) {
          setWeddings(wRes.data);
          if (!selectedWeddingId && initialWeddingId) {
            setSelectedWeddingId(initialWeddingId);
          }
        }

        if (vRes.success && vRes.data) {
          setVendors(vRes.data);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    }

    loadInitialData();
  }, []);

  // Load RFPs whenever selectedWeddingId changes
  async function loadQuotationRequests() {
    try {
      setLoading(true);
      const url = selectedWeddingId
        ? `/api/quotations?weddingId=${selectedWeddingId}`
        : '/api/quotations';

      const res = await apiRequest(url);
      if (res.success && res.data) {
        setRequests(res.data);
        if (res.data.length > 0) {
          // Keep current selection if valid, else pick the first
          const stillExists = res.data.find((r: any) => r.id === selectedRequest?.id);
          const toSelect = stillExists || res.data[0];
          setSelectedRequest(toSelect);
          loadComparison(toSelect.id);
        } else {
          setSelectedRequest(null);
          setComparisonData(null);
        }
      }
    } catch (e) {
      console.error('Error loading quotation requests:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuotationRequests();
  }, [selectedWeddingId]);

  async function loadComparison(requestId: string) {
    try {
      setLoadingComparison(true);
      const res = await apiRequest(`/api/quotations/${requestId}/comparison`);
      if (res.success && res.data) {
        setComparisonData(res.data);
      }
    } catch (e) {
      console.error('Error loading comparison:', e);
    } finally {
      setLoadingComparison(false);
    }
  }

  async function handleSelectFinalQuotation(quoteId: string) {
    if (!selectedRequest) return;
    if (
      !confirm(
        'Are you sure you want to award this quotation? Competing quotes will be automatically closed, and this vendor contract will be formally linked to the wedding operations ledger.'
      )
    ) {
      return;
    }

    setAwardingId(quoteId);
    try {
      const res = await apiRequest(`/api/quotations/${selectedRequest.id}/select`, {
        method: 'POST',
        body: JSON.stringify({
          selectedQuotationId: quoteId,
          selectionNotes: 'Selected via Multi-Vendor Quotations comparative evaluation.',
        }),
      });

      if (res.success) {
        alert(res.message || '🎉 Vendor contract awarded successfully!');
        await loadComparison(selectedRequest.id);
        await loadQuotationRequests();
      } else {
        alert(res.message || 'Failed to award quotation');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with server');
    } finally {
      setAwardingId(null);
    }
  }

  // Create RFP Submit
  async function handleCreateRfp(e: React.FormEvent) {
    e.preventDefault();
    if (!rfpForm.weddingId) {
      alert('Please select a wedding');
      return;
    }
    if (rfpForm.invitedVendorIds.length === 0) {
      alert('Please select at least one vendor to invite');
      return;
    }

    setCreatingRfp(true);
    try {
      const res = await apiRequest('/api/quotations', {
        method: 'POST',
        body: JSON.stringify(rfpForm),
      });

      if (res.success) {
        alert('🎉 Multi-Vendor RFP launched successfully! Vendors can now submit bids.');
        setIsRfpModalOpen(false);
        setRfpForm({
          weddingId: selectedWeddingId || (weddings[0]?.id || ''),
          category: VendorCategory.CATERING,
          title: '',
          guestCount: 400,
          targetBudget: 2500000,
          specifications: '',
          invitedVendorIds: [],
        });
        await loadQuotationRequests();
      } else {
        alert(res.message || 'Failed to create quotation request');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating RFP');
    } finally {
      setCreatingRfp(false);
    }
  }

  // Record Bid Submit
  async function handleRecordBid(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRequest) {
      alert('Please select an RFP first');
      return;
    }
    if (!bidForm.vendorId) {
      alert('Please select a vendor');
      return;
    }

    setSubmittingBid(true);
    try {
      const includedArray = bidForm.includedItems
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await apiRequest(`/api/quotations/${selectedRequest.id}/quotes`, {
        method: 'POST',
        body: JSON.stringify({
          vendorId: bidForm.vendorId,
          baseAmount: Number(bidForm.baseAmount),
          pricePerPlate: bidForm.pricePerPlate ? Number(bidForm.pricePerPlate) : undefined,
          extraHourRate: bidForm.extraHourRate ? Number(bidForm.extraHourRate) : undefined,
          additionalCosts: Number(bidForm.additionalCosts) || 0,
          menuDetails: bidForm.menuDetails,
          includedItems: includedArray,
          notes: bidForm.notes,
          isAgencyRecommended: bidForm.isAgencyRecommended,
        }),
      });

      if (res.success) {
        alert('🎉 Vendor bid successfully recorded into the Multi-Vendor Matrix!');
        setIsBidModalOpen(false);
        await loadComparison(selectedRequest.id);
        await loadQuotationRequests();
      } else {
        alert(res.message || 'Failed to record vendor quotation');
      }
    } catch (err: any) {
      alert(err.message || 'Error recording bid');
    } finally {
      setSubmittingBid(false);
    }
  }

  // Filtered requests list
  const filteredRequests = requests.filter((r) => {
    const matchesCategory =
      categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'ALL' || r.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const quotes = comparisonData?.quotations || [];
  const req = comparisonData?.request || selectedRequest;
  const wedding = comparisonData?.wedding || selectedRequest?.wedding;
  const guestCount = req?.guestCount || wedding?.guestCount || 400;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <FileSpreadsheet className="w-4 h-4 text-gold-dark" />
            <span>Competitive Procurement Engine</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            Multi-Vendor Quotations Bidding Matrix
          </h2>
          <p className="text-xs text-darkText/70">
            Side-by-side comparative bidding engine. Evaluate transparent per-plate pricing, multi-vendor deliverables, and award binding contracts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setRfpForm((prev) => ({
                ...prev,
                weddingId: selectedWeddingId || (weddings[0]?.id || ''),
              }));
              setIsRfpModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New RFP</span>
          </button>

          {selectedRequest && (
            <button
              onClick={() => {
                // Pre-populate suitable vendor
                const eligibleVendors = vendors.filter(
                  (v) => v.category === selectedRequest.category
                );
                if (eligibleVendors.length > 0) {
                  setBidForm((prev) => ({ ...prev, vendorId: eligibleVendors[0].id }));
                }
                setIsBidModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-navy-900 text-gold font-bold text-xs hover:bg-navy-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Vendor Bid</span>
            </button>
          )}
        </div>
      </div>

      {/* Protocol Banner */}
      <div className="bg-navy-900 text-white p-4 rounded-xl border border-gold/40 flex items-start gap-3 text-xs shadow-md">
        <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-gold uppercase tracking-wider">
            Multi-Vendor Decision Protocol & Audit Trail
          </div>
          <p className="text-cream-300 leading-relaxed">
            Agency planners review multi-vendor proposals, inspect menu scope, and flag recommendations (★). Awarding a vendor immediately binds the contract to the wedding ledger and automatically archives competing bids while preserving full historical transparency.
          </p>
        </div>
      </div>

      {/* Filter and Wedding Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-navy-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Wedding Selector Dropdown */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Crown className="w-4 h-4 text-gold-dark flex-shrink-0" />
          <select
            value={selectedWeddingId}
            onChange={(e) => setSelectedWeddingId(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-cream/40 border border-navy-200 rounded-xl text-navy-900 font-bold focus:outline-none focus:border-gold"
          >
            <option value="">👑 All Active Weddings ({weddings.length})</option>
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>
                [{w.weddingCode}] {w.brideName} & {w.groomName} ({w.location})
              </option>
            ))}
          </select>
        </div>

        {/* Category & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-cream/40 border border-navy-200 rounded-xl text-navy-900 font-semibold focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Categories</option>
            <option value={VendorCategory.CATERING}>🍽️ Catering</option>
            <option value={VendorCategory.DECORATION}>🌸 Decoration</option>
            <option value={VendorCategory.PHOTOGRAPHY}>📸 Photography</option>
            <option value={VendorCategory.DJ_MUSIC}>🎵 DJ & Music</option>
            <option value={VendorCategory.MAKEUP_ARTIST}>💄 Makeup & Mehndi</option>
            <option value={VendorCategory.TRANSPORTATION}>🚗 Transportation</option>
            <option value={VendorCategory.VENUE}>🏰 Venue</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-cream/40 border border-navy-200 rounded-xl text-navy-900 font-semibold focus:outline-none focus:border-gold"
          >
            <option value="ALL">All Statuses</option>
            <option value={QuotationRequestStatus.INVITED}>Invited</option>
            <option value={QuotationRequestStatus.COMPARING}>Comparing</option>
            <option value={QuotationRequestStatus.AWARDED}>Awarded</option>
            <option value={QuotationRequestStatus.CLOSED}>Closed</option>
          </select>

          <button
            onClick={() => loadQuotationRequests()}
            className="p-2 rounded-xl border border-navy-200 text-darkText hover:text-navy-900 hover:bg-navy-50 cursor-pointer"
            title="Refresh Requests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RFPs Selection Strip */}
      {filteredRequests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-darkText/70">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-royal">
              Active RFP Packages ({filteredRequests.length})
            </span>
            <span>Click an RFP below to inspect its multi-vendor matrix</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {filteredRequests.map((r) => {
              const isSelected = selectedRequest?.id === r.id;
              const bidsCount = r.quotations?.length || 0;

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRequest(r);
                    loadComparison(r.id);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-navy-900 text-gold shadow-md border-2 border-gold'
                      : 'bg-white border border-navy-200 text-darkText hover:border-gold/60 shadow-sm'
                  }`}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-royal bg-royal/10 px-1.5 py-0.2 rounded">
                        {r.category}
                      </span>
                      <span>{r.title}</span>
                    </div>
                    <div className="text-[10px] font-normal text-darkText/60 mt-0.5">
                      {r.wedding?.weddingCode ? `[${r.wedding.weddingCode}]` : ''} •{' '}
                      <strong>{bidsCount} Bids</strong> • {r.status}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison Area */}
      {loading ? (
        <div className="bg-white border border-navy-200 rounded-2xl p-12 text-center space-y-3 animate-pulse">
          <div className="h-6 w-48 bg-navy-100 rounded mx-auto" />
          <div className="h-4 w-72 bg-navy-50 rounded mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-navy-50 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        /* Empty State */
        <div className="bg-white border-2 border-dashed border-gold/40 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gold/15 text-gold-dark flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-navy-900">
              No Multi-Vendor RFPs Found
            </h3>
            <p className="text-xs text-darkText/70 mt-1 max-w-md mx-auto leading-relaxed">
              {selectedWeddingId
                ? 'No quotation requests currently open for this wedding project. Launch an RFP to invite competitive multi-vendor bids.'
                : 'No quotation requests match the current filters. Launch an RFP to begin multi-vendor comparison.'}
            </p>
          </div>
          <button
            onClick={() => {
              setRfpForm((prev) => ({
                ...prev,
                weddingId: selectedWeddingId || (weddings[0]?.id || ''),
              }));
              setIsRfpModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch First Multi-Vendor RFP</span>
          </button>
        </div>
      ) : (
        /* Side-by-Side Comparison Matrix */
        <div className="space-y-4">
          {/* Active RFP Header Card */}
          <div className="bg-white p-5 rounded-2xl border border-gold/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2.5 py-0.5 rounded-full">
                  {req?.category}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    req?.status === QuotationRequestStatus.AWARDED
                      ? 'bg-green-100 text-green-800'
                      : 'bg-royal/10 text-royal'
                  }`}
                >
                  {req?.status}
                </span>
                {wedding?.weddingCode && (
                  <span className="text-xs text-darkText/60">
                    Project: <strong>{wedding.weddingCode}</strong> ({wedding.brideName} & {wedding.groomName})
                  </span>
                )}
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 mt-1.5">
                {req?.title}
              </h3>
              <p className="text-xs text-darkText/70 mt-0.5">
                Guaranteed Scope: <strong>{guestCount} Guests</strong> | Target Budget: <strong>₹{(req?.targetBudget || 2500000).toLocaleString('en-IN')}</strong> | Venue: <strong>{wedding?.location || 'Udaipur, Rajasthan'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const eligibleVendors = vendors.filter(
                    (v) => v.category === req?.category
                  );
                  if (eligibleVendors.length > 0) {
                    setBidForm((prev) => ({ ...prev, vendorId: eligibleVendors[0].id }));
                  }
                  setIsBidModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Competing Bid</span>
              </button>
            </div>
          </div>

          {/* Bids Grid */}
          {quotes.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-navy-200 rounded-2xl p-10 text-center space-y-3">
              <Building className="w-10 h-10 text-darkText/40 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-navy-900">
                Awaiting Vendor Proposals
              </h4>
              <p className="text-xs text-darkText/70 max-w-sm mx-auto">
                No quotations have been logged for this RFP yet. Record a vendor quotation to populate the comparison matrix.
              </p>
              <button
                onClick={() => {
                  const eligibleVendors = vendors.filter(
                    (v) => v.category === req?.category
                  );
                  if (eligibleVendors.length > 0) {
                    setBidForm((prev) => ({ ...prev, vendorId: eligibleVendors[0].id }));
                  }
                  setIsBidModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-navy-900 text-gold font-bold text-xs hover:bg-navy-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record First Vendor Bid</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotes.map((q: any, idx: number) => {
                const isSelected = q.status === QuotationStatus.SELECTED;
                const isClosed =
                  q.status === QuotationStatus.CLOSED || q.status === QuotationStatus.REJECTED;
                const totalWithPlate =
                  q.computedTotal ||
                  q.baseAmount + (q.pricePerPlate ? q.pricePerPlate * guestCount : 0);

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                      isSelected
                        ? 'bg-navy-950 text-white border-2 border-gold shadow-gold-glow'
                        : isClosed
                        ? 'bg-white/70 border border-navy-200 opacity-60'
                        : 'bg-white border-2 border-gold/40 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Badges Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-navy-200/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-100 text-navy-900">
                        Option {idx + 1}
                      </span>

                      {isSelected && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold-gradient text-navy-950 shadow-sm flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span>Awarded Contract</span>
                        </span>
                      )}

                      {q.isAgencyRecommended && !isSelected && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          ★ Planner Recommended
                        </span>
                      )}

                      {isClosed && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-navy-100 text-darkText/60">
                          Auto-Closed
                        </span>
                      )}
                    </div>

                    {/* Vendor Identity & Pricing Header */}
                    <div className="mt-3 space-y-2">
                      <h4
                        className={`font-serif text-lg font-bold ${
                          isSelected ? 'text-cream' : 'text-navy-900'
                        }`}
                      >
                        {q.vendor?.name || `Vendor Option ${idx + 1}`}
                      </h4>
                      <div className="text-xs text-darkText/60 flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{q.vendor?.rating || 4.9}</span>
                        </span>
                        <span>•</span>
                        <span>{q.vendor?.address || 'Udaipur, Rajasthan'}</span>
                      </div>

                      {/* Highlighted Price Per Plate */}
                      <div className="p-3 rounded-xl bg-navy-50/80 border border-gold/30 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-royal block">
                          Price Per Plate ({guestCount} Guests)
                        </span>
                        <div className="font-serif text-2xl font-bold text-navy-900 mt-0.5">
                          {q.pricePerPlate
                            ? `₹${q.pricePerPlate.toLocaleString('en-IN')}`
                            : 'Package Base'}
                          <span className="text-xs font-normal text-darkText/70"> / plate</span>
                        </div>
                        <div className="text-[11px] text-royal font-semibold mt-1">
                          Computed Total: <strong>₹{totalWithPlate.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Itemized Comparison Table */}
                    <div className="my-4 space-y-2 text-xs border-y border-navy-100 py-3">
                      <div className="flex justify-between items-center text-darkText/80">
                        <span className="font-medium">Base Production Fee:</span>
                        <span className="font-bold">₹{q.baseAmount.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex justify-between items-center text-darkText/80">
                        <span className="font-medium">Extra Hour Rate:</span>
                        <span className="font-bold">
                          {q.extraHourRate
                            ? `₹${q.extraHourRate.toLocaleString('en-IN')}/hr`
                            : 'Standard'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-darkText/80">
                        <span className="font-medium">Additional Setup Costs:</span>
                        <span className="font-bold">
                          ₹{(q.additionalCosts || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Menu Details & Inclusions */}
                    <div className="space-y-2 text-xs">
                      <span className="font-bold text-navy-900 uppercase tracking-wider text-[10px] block">
                        Scope & Inclusions:
                      </span>
                      <p
                        className={`text-[11px] leading-relaxed italic ${
                          isSelected ? 'text-cream-300' : 'text-darkText/80'
                        }`}
                      >
                        &quot;{q.menuDetails || 'Complete multi-course royal setup with live counters.'}&quot;
                      </p>

                      <div className="space-y-1 pt-1">
                        {(q.includedItems || []).map((item: string, i: number) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>

                      {q.notes && (
                        <div className="pt-2 text-[10px] text-darkText/60 border-t border-navy-100">
                          Notes: {q.notes}
                        </div>
                      )}
                    </div>

                    {/* Selection Action Button */}
                    <div className="mt-6 pt-4 border-t border-navy-100">
                      {isSelected ? (
                        <div className="w-full py-2.5 rounded-lg bg-green-900/60 text-green-300 border border-green-500 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-green-400" />
                          <span>Awarded & Bound to Wedding</span>
                        </div>
                      ) : isClosed ? (
                        <div className="w-full py-2 text-center text-xs text-darkText/50 font-medium">
                          Archived in Quotation History
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelectFinalQuotation(q.id)}
                          disabled={awardingId === q.id}
                          className="w-full py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {awardingId === q.id ? (
                            <span>Awarding Contract...</span>
                          ) : (
                            <>
                              <Award className="w-4 h-4" />
                              <span>Award Vendor & Lock Quote</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create RFP */}
      {isRfpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-cream border border-gold rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-navy-gradient text-white p-6 border-b border-gold/30 relative">
              <button
                onClick={() => setIsRfpModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-gold hover:text-white hover:bg-navy-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-serif text-2xl font-bold text-cream">
                Launch Multi-Vendor RFP
              </h3>
              <p className="text-xs text-cream-300 mt-1">
                Invite competitive proposals from verified luxury artisans and catering specialists.
              </p>
            </div>

            <form onSubmit={handleCreateRfp} className="p-6 space-y-4 text-xs">
              {/* Select Wedding */}
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Target Wedding Project *
                </label>
                <select
                  required
                  value={rfpForm.weddingId}
                  onChange={(e) => setRfpForm({ ...rfpForm, weddingId: e.target.value })}
                  className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                >
                  <option value="">-- Choose Wedding Project --</option>
                  {weddings.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{w.weddingCode}] {w.brideName} & {w.groomName} ({w.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category and Title */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">Service Category *</label>
                  <select
                    value={rfpForm.category}
                    onChange={(e) =>
                      setRfpForm({ ...rfpForm, category: e.target.value as VendorCategory })
                    }
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  >
                    <option value={VendorCategory.CATERING}>🍽️ Catering</option>
                    <option value={VendorCategory.DECORATION}>🌸 Decoration</option>
                    <option value={VendorCategory.PHOTOGRAPHY}>📸 Photography</option>
                    <option value={VendorCategory.DJ_MUSIC}>🎵 DJ & Music</option>
                    <option value={VendorCategory.MAKEUP_ARTIST}>💄 Makeup & Mehndi</option>
                    <option value={VendorCategory.TRANSPORTATION}>🚗 Transportation</option>
                    <option value={VendorCategory.VENUE}>🏰 Venue</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-darkText mb-1">RFP Title *</label>
                  <input
                    type="text"
                    required
                    value={rfpForm.title}
                    onChange={(e) => setRfpForm({ ...rfpForm, title: e.target.value })}
                    placeholder="e.g. Royal Banquet Catering RFP"
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Guest Count and Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">Guaranteed Guests</label>
                  <input
                    type="number"
                    value={rfpForm.guestCount}
                    onChange={(e) =>
                      setRfpForm({ ...rfpForm, guestCount: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-darkText mb-1">Target Budget (INR)</label>
                  <input
                    type="number"
                    value={rfpForm.targetBudget}
                    onChange={(e) =>
                      setRfpForm({ ...rfpForm, targetBudget: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Specifications */}
              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Deliverables & Specifications Scope *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rfpForm.specifications}
                  onChange={(e) => setRfpForm({ ...rfpForm, specifications: e.target.value })}
                  placeholder="Describe culinary expectations, dietary restrictions, live stations, service staff requirements, and setup times..."
                  className="w-full p-2 bg-white border border-navy-200 rounded-lg text-xs"
                />
              </div>

              {/* Invited Vendors Selection */}
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Select Vendors to Invite *
                </label>
                <div className="max-h-36 overflow-y-auto bg-white border border-navy-200 rounded-lg p-2 space-y-1.5">
                  {vendors
                    .filter((v) => v.category === rfpForm.category)
                    .map((v) => {
                      const checked = rfpForm.invitedVendorIds.includes(v.id);
                      return (
                        <label
                          key={v.id}
                          className="flex items-center gap-2 p-1 hover:bg-cream rounded cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRfpForm({
                                  ...rfpForm,
                                  invitedVendorIds: [...rfpForm.invitedVendorIds, v.id],
                                });
                              } else {
                                setRfpForm({
                                  ...rfpForm,
                                  invitedVendorIds: rfpForm.invitedVendorIds.filter(
                                    (id) => id !== v.id
                                  ),
                                });
                              }
                            }}
                            className="rounded border-navy-300 text-royal focus:ring-gold"
                          />
                          <span className="font-semibold text-navy-900">{v.name}</span>
                          <span className="text-[10px] text-darkText/60">
                            (★ {v.rating} • {v.address})
                          </span>
                        </label>
                      );
                    })}
                  {vendors.filter((v) => v.category === rfpForm.category).length === 0 && (
                    <div className="text-xs text-darkText/60 p-2 text-center">
                      No vendors found in this category. They will be auto-invited upon profile onboarding.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRfpModalOpen(false)}
                  className="px-4 py-2 font-medium text-darkText cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingRfp}
                  className="px-6 py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 disabled:opacity-50 cursor-pointer"
                >
                  {creatingRfp ? 'Launching RFP...' : 'Launch Multi-Vendor RFP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Vendor Bid */}
      {isBidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-cream border border-gold rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-navy-gradient text-white p-6 border-b border-gold/30 relative">
              <button
                onClick={() => setIsBidModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-gold hover:text-white hover:bg-navy-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-serif text-2xl font-bold text-cream">
                Record Competing Vendor Bid
              </h3>
              <p className="text-xs text-cream-300 mt-1">
                Enter proposal quotation for &quot;{selectedRequest?.title}&quot;
              </p>
            </div>

            <form onSubmit={handleRecordBid} className="p-6 space-y-4 text-xs">
              {/* Select Vendor */}
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Vendor Partner *
                </label>
                <select
                  required
                  value={bidForm.vendorId}
                  onChange={(e) => setBidForm({ ...bidForm, vendorId: e.target.value })}
                  className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.category} • ★ {v.rating})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">
                    Base Production Fee (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={bidForm.baseAmount}
                    onChange={(e) =>
                      setBidForm({ ...bidForm, baseAmount: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-darkText mb-1">
                    Price Per Plate (INR, optional)
                  </label>
                  <input
                    type="number"
                    value={bidForm.pricePerPlate}
                    onChange={(e) =>
                      setBidForm({ ...bidForm, pricePerPlate: Number(e.target.value) })
                    }
                    placeholder="e.g. 1850"
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-darkText mb-1">
                    Extra Hour Rate (INR/hr)
                  </label>
                  <input
                    type="number"
                    value={bidForm.extraHourRate}
                    onChange={(e) =>
                      setBidForm({ ...bidForm, extraHourRate: Number(e.target.value) })
                    }
                    placeholder="e.g. 25000"
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-darkText mb-1">
                    Additional Setup Costs (INR)
                  </label>
                  <input
                    type="number"
                    value={bidForm.additionalCosts}
                    onChange={(e) =>
                      setBidForm({ ...bidForm, additionalCosts: Number(e.target.value) })
                    }
                    placeholder="e.g. 30000"
                    className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Menu & Inclusions */}
              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Menu & Inclusions Scope *
                </label>
                <textarea
                  required
                  rows={2}
                  value={bidForm.menuDetails}
                  onChange={(e) => setBidForm({ ...bidForm, menuDetails: e.target.value })}
                  placeholder="Royal Rajasthani & Continental Gourmet Buffet..."
                  className="w-full p-2 bg-white border border-navy-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Deliverable Items (comma separated)
                </label>
                <input
                  type="text"
                  value={bidForm.includedItems}
                  onChange={(e) => setBidForm({ ...bidForm, includedItems: e.target.value })}
                  placeholder="Live Chaat Counter, Royal Butler Service, Copper Chafing Dishes"
                  className="w-full p-2 bg-white border border-navy-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Planner Assessment / Proposal Notes
                </label>
                <textarea
                  rows={2}
                  value={bidForm.notes}
                  onChange={(e) => setBidForm({ ...bidForm, notes: e.target.value })}
                  placeholder="Quality of ingredients, previous royal wedding track record, setup lead time..."
                  className="w-full p-2 bg-white border border-navy-200 rounded-lg text-xs"
                />
              </div>

              {/* Recommended Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recommendedToggle"
                  checked={bidForm.isAgencyRecommended}
                  onChange={(e) =>
                    setBidForm({ ...bidForm, isAgencyRecommended: e.target.checked })
                  }
                  className="rounded border-navy-300 text-royal focus:ring-gold"
                />
                <label
                  htmlFor="recommendedToggle"
                  className="font-bold text-navy-900 cursor-pointer"
                >
                  ★ Flag as Grand Bandhan Recommended Quotation
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBidModalOpen(false)}
                  className="px-4 py-2 font-medium text-darkText cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="px-6 py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 disabled:opacity-50 cursor-pointer"
                >
                  {submittingBid ? 'Submitting Bid...' : 'Record Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function QuotationsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-96 bg-navy-100 rounded" />
      <div className="h-20 bg-navy-50 rounded-xl" />
      <div className="h-12 bg-navy-100 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-72 bg-navy-50 rounded-2xl" />
        <div className="h-72 bg-navy-50 rounded-2xl" />
        <div className="h-72 bg-navy-50 rounded-2xl" />
      </div>
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={<QuotationsLoadingSkeleton />}>
      <QuotationsContent />
    </Suspense>
  );
}
