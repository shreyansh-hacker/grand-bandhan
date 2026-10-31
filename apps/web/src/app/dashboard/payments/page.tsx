'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  Calculator,
  FileCheck,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { PaymentStatus, PaymentMilestone } from '@grand-bandhan/shared';

export default function PaymentsSettlementPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [wedding, setWedding] = useState<any | null>(null);
  const [settlement, setSettlement] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Settlement Form State
  const [settlementForm, setSettlementForm] = useState({
    extraGuestCount: 25,
    extraPlatesCount: 25,
    extraPlateRate: 1850,
    extraVendorHours: 2,
    extraVendorHourRate: 25000,
    unexpectedExpenses: 45000,
    notes: 'Reconciled 25 extra buffet plates and 2 extended DJ sound hours.',
  });

  const [savingSettlement, setSavingSettlement] = useState(false);

  // Record Payment Modal
  const [activePaymentToPay, setActivePaymentToPay] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [txnRef, setTxnRef] = useState<string>('');
  const [recordingPay, setRecordingPay] = useState(false);

  async function loadFinancials() {
    try {
      const wRes = await apiRequest('/api/weddings');
      if (wRes.success && wRes.data && wRes.data.length > 0) {
        const w = wRes.data[0];
        setWedding(w);

        const pRes = await apiRequest(`/api/payments?weddingId=${w.id}`);
        if (pRes.success && pRes.data) {
          setPayments(pRes.data);
        }

        const sRes = await apiRequest(`/api/settlements/${w.id}`);
        if (sRes.success && sRes.data) {
          setSettlement(sRes.data.settlement);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinancials();
  }, []);

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!activePaymentToPay) return;
    setRecordingPay(true);

    try {
      const res = await apiRequest(`/api/payments/${activePaymentToPay.id}/transactions`, {
        method: 'POST',
        body: JSON.stringify({
          paidAmount: Number(payAmount),
          transactionRef: txnRef || `TXN-${Date.now().toString().slice(-6)}`,
          paymentMethod: 'NEFT_RTGS_TRANSFER',
        }),
      });

      if (res.success) {
        alert(res.message);
        setActivePaymentToPay(null);
        loadFinancials();
      }
    } catch (e: any) {
      alert(e.message || 'Error recording transaction');
    } finally {
      setRecordingPay(false);
    }
  }

  async function handleCalculateAndSaveSettlement(e: React.FormEvent) {
    e.preventDefault();
    if (!wedding) return;
    setSavingSettlement(true);

    try {
      const res = await apiRequest(`/api/settlements/${wedding.id}`, {
        method: 'POST',
        body: JSON.stringify(settlementForm),
      });

      if (res.success) {
        alert(res.message);
        loadFinancials();
      }
    } catch (e: any) {
      alert(e.message || 'Error calculating settlement');
    } finally {
      setSavingSettlement(false);
    }
  }

  const clientPayments = payments.filter((p) => p.type === 'CLIENT_MILESTONE');
  const vendorPayments = payments.filter((p) => p.type === 'VENDOR_PAYMENT');

  const totalClientDue = clientPayments.reduce((s, p) => s + p.amount, 0);
  const totalClientPaid = clientPayments.reduce((s, p) => s + (p.paidAmount || 0), 0);
  const totalVendorAgreed = vendorPayments.reduce((s, p) => s + p.amount, 0);
  const totalVendorDisbursed = vendorPayments.reduce((s, p) => s + (p.paidAmount || 0), 0);

  // Dynamic preview calculations
  const extraPlateTotal = settlementForm.extraPlatesCount * settlementForm.extraPlateRate;
  const extraHoursTotal = settlementForm.extraVendorHours * settlementForm.extraVendorHourRate;
  const additionalChargesTotal = extraPlateTotal + extraHoursTotal + settlementForm.unexpectedExpenses;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <CreditCard className="w-4 h-4 text-gold-dark" />
            <span>Financial Ledger & Escrow</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            Payment Management & Post-Wedding Settlement
          </h2>
          <p className="text-xs text-darkText/70">
            Client milestone disbursements, vendor payments, and post-wedding reconciliation of extra guests/hours.
          </p>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gold/30 shadow-sm">
          <span className="text-[11px] font-semibold text-darkText/70 uppercase">Client Contract Base</span>
          <div className="text-2xl font-serif font-bold text-navy-900 mt-1">₹{totalClientDue.toLocaleString()}</div>
          <div className="text-xs text-green-700 font-semibold mt-1">₹{totalClientPaid.toLocaleString()} Received</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gold/30 shadow-sm">
          <span className="text-[11px] font-semibold text-darkText/70 uppercase">Client Pending Due</span>
          <div className="text-2xl font-serif font-bold text-amber-700 mt-1">
            ₹{(totalClientDue - totalClientPaid).toLocaleString()}
          </div>
          <div className="text-xs text-darkText/60 mt-1">Milestones awaiting trigger</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gold/30 shadow-sm">
          <span className="text-[11px] font-semibold text-darkText/70 uppercase">Vendor Contracts</span>
          <div className="text-2xl font-serif font-bold text-royal mt-1">₹{totalVendorAgreed.toLocaleString()}</div>
          <div className="text-xs text-green-700 font-semibold mt-1">₹{totalVendorDisbursed.toLocaleString()} Disbursed</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gold/30 shadow-sm">
          <span className="text-[11px] font-semibold text-darkText/70 uppercase">Agency Operating Margin</span>
          <div className="text-2xl font-serif font-bold text-green-700 mt-1">
            ₹{(totalClientDue - totalVendorAgreed).toLocaleString()}
          </div>
          <div className="text-xs text-darkText/60 mt-1">Gross Projected P&L</div>
        </div>
      </div>

      {/* Section 1: Client Milestone Payments */}
      <div className="bg-white border border-gold/30 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-navy-100">
          <h3 className="font-serif text-lg font-bold text-navy-900">
            Client Payment Milestones (25% - 50% - 25%)
          </h3>
          <span className="text-xs text-darkText/70">
            Anti-duplicate transaction verification enabled
          </span>
        </div>

        <div className="divide-y divide-navy-100 text-xs">
          {clientPayments.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-navy-900 text-sm">
                  {p.milestoneName.replace(/_/g, ' ')}
                </div>
                <div className="text-darkText/60 mt-0.5">
                  Due: {new Date(p.dueDate).toLocaleDateString()} {p.notes ? `• ${p.notes}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-serif text-base font-bold text-navy-900">
                    ₹{p.amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-green-700 font-semibold">
                    Paid: ₹{(p.paidAmount || 0).toLocaleString()}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    p.status === PaymentStatus.PAID
                      ? 'bg-green-100 text-green-800'
                      : p.status === PaymentStatus.PARTIALLY_PAID
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {p.status}
                </span>

                {p.status !== PaymentStatus.PAID && (
                  <button
                    onClick={() => {
                      setActivePaymentToPay(p);
                      setPayAmount(p.amount - (p.paidAmount || 0));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-navy-900 text-gold font-bold text-xs hover:bg-navy-800"
                  >
                    Record Payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Post-Wedding Settlement Engine */}
      <div className="bg-cream-100 border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gold/30">
          <div className="w-10 h-10 rounded-xl bg-gold-gradient p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-gold" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-navy-900">
              Post-Wedding Financial Reconciliation & Settlement
            </h3>
            <p className="text-xs text-darkText/75">
              Match actual caterer plate count, extra hours, and unexpected expenses against original contracts.
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculateAndSaveSettlement} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
          {/* Controls */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-navy-200/80 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Extra Plates Served (Actual vs Guarantee)
                </label>
                <input
                  type="number"
                  value={settlementForm.extraPlatesCount}
                  onChange={(e) => setSettlementForm({ ...settlementForm, extraPlatesCount: Number(e.target.value) })}
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Extra Plate Rate (Locked in RFP)
                </label>
                <input
                  type="number"
                  value={settlementForm.extraPlateRate}
                  onChange={(e) => setSettlementForm({ ...settlementForm, extraPlateRate: Number(e.target.value) })}
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Extended Vendor Hours (DJ / Sound / Bar)
                </label>
                <input
                  type="number"
                  value={settlementForm.extraVendorHours}
                  onChange={(e) => setSettlementForm({ ...settlementForm, extraVendorHours: Number(e.target.value) })}
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Hourly Overage Rate (INR/hour)
                </label>
                <input
                  type="number"
                  value={settlementForm.extraVendorHourRate}
                  onChange={(e) => setSettlementForm({ ...settlementForm, extraVendorHourRate: Number(e.target.value) })}
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-darkText mb-1">
                Unexpected Contingency Expenses (INR)
              </label>
              <input
                type="number"
                value={settlementForm.unexpectedExpenses}
                onChange={(e) => setSettlementForm({ ...settlementForm, unexpectedExpenses: Number(e.target.value) })}
                className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-darkText mb-1">
                Settlement Audit Notes
              </label>
              <input
                type="text"
                value={settlementForm.notes}
                onChange={(e) => setSettlementForm({ ...settlementForm, notes: e.target.value })}
                className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettlement}
              className="w-full py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all disabled:opacity-50"
            >
              {savingSettlement ? 'Reconciling Ledger...' : 'Calculate & Reconcile Final Settlement'}
            </button>
          </div>

          {/* Settlement Preview Summary */}
          <div className="lg:col-span-5 bg-navy-gradient text-white p-6 rounded-xl border border-gold/40 shadow-navy-deep space-y-4">
            <span className="text-xs uppercase tracking-widest text-gold font-bold block">
              Reconciled Financial Statement
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-navy-800">
                <span className="text-cream-300">Base Client Contract</span>
                <span className="font-semibold text-gold">₹{(wedding?.budgetMin || 3500000).toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-navy-800">
                <span className="text-cream-300">Extra Plates ({settlementForm.extraPlatesCount} @ ₹{settlementForm.extraPlateRate})</span>
                <span className="font-semibold text-gold">+₹{extraPlateTotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-navy-800">
                <span className="text-cream-300">Extended Hours ({settlementForm.extraVendorHours} hrs @ ₹{settlementForm.extraVendorHourRate})</span>
                <span className="font-semibold text-gold">+₹{extraHoursTotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-navy-800">
                <span className="text-cream-300">Unexpected Expenses</span>
                <span className="font-semibold text-gold">+₹{settlementForm.unexpectedExpenses.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-2 border-t-2 border-gold/30 font-bold text-sm">
                <span className="text-cream">Final Reconciled Client Bill</span>
                <span className="text-gold-gradient">
                  ₹{((wedding?.budgetMin || 3500000) + additionalChargesTotal).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-navy-950/70 p-3.5 rounded-lg border border-gold/20 text-[11px] text-cream-300 space-y-1">
              <div className="font-bold text-gold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Audited Profit Reconciliation</span>
              </div>
              <p>
                Calculated Final Agency Profit: <strong>₹{(((wedding?.budgetMin || 3500000) + additionalChargesTotal) - totalVendorAgreed).toLocaleString()}</strong>.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Record Payment Transaction Modal */}
      {activePaymentToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white border border-gold rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-navy-900">
              Record Payment Transaction
            </h3>
            <p className="text-darkText/70">
              Milestone: <strong>{activePaymentToPay.milestoneName}</strong>
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Amount to Record (INR)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Bank Reference / NEFT UTR Number</label>
                <input
                  type="text"
                  required
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  placeholder="e.g. HDFC-NEFT-991203"
                  className="w-full p-2 bg-cream-50 border border-navy-200 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePaymentToPay(null)}
                  className="px-4 py-2 text-darkText font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPay}
                  className="px-5 py-2 bg-gold-gradient text-navy-950 font-bold rounded-lg shadow-sm"
                >
                  {recordingPay ? 'Verifying...' : 'Verify & Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
