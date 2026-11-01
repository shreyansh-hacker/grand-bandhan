'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Crown,

  FileCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  PenTool,
  RotateCcw,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { AgreementStatus, VerificationResponse } from '@grand-bandhan/shared';

export default function ClientPortalPage() {
  const params = useParams();
  const token = params?.token as string;
  const [wedding, setWedding] = useState<any | null>(null);
  const [agreement, setAgreement] = useState<any | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (token && typeof window !== 'undefined') {
      sessionStorage.setItem('gb_portal_token', token);
    }

    async function loadClientData() {
      try {
        const wRes = await apiRequest('/api/weddings');
        if (wRes.success && wRes.data && wRes.data.length > 0) {
          const w = wRes.data[0];
          setWedding(w);

          const aRes = await apiRequest(`/api/agreements/${w.id}`);
          if (aRes.success && aRes.data) {
            setAgreement(aRes.data);
          }

          const vRes = await apiRequest(`/api/verifications?weddingId=${w.id}`);
          if (vRes.success && vRes.data) {
            setVerifications(vRes.data);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadClientData();
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
        // Reload verifications
        if (wedding) {
          const vRes = await apiRequest(`/api/verifications?weddingId=${wedding.id}`);
          if (vRes.success) setVerifications(vRes.data);
        }
      }
    } catch (e: any) {
      alert(e.message || 'Error confirming');
    }
  }

  const isAlreadySigned = agreement?.status === AgreementStatus.SIGNED;

  return (
    <div className="min-h-screen bg-cream text-darkText">
      {/* Header */}
      <header className="bg-navy-900 text-white p-6 border-b border-gold/40 shadow-navy-deep">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-gradient p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-gold" />
              </div>
            </div>
            <div>
              <span className="font-serif text-xl font-bold text-gold-gradient">
                GRAND BANDHAN
              </span>
              <span className="block text-[10px] text-cream-300 uppercase tracking-widest font-semibold">
                Client & Couple Privileged Portal
              </span>
            </div>
          </div>

          <span className="text-xs bg-gold/15 text-gold border border-gold/30 px-3 py-1 rounded-full font-bold">
            Secured Access Link
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 sm:p-8 space-y-8">
        {/* Couple Banner */}
        <div className="bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2.5 py-0.5 rounded-full">
              {wedding?.weddingCode || 'GB-ROYAL'}
            </span>
            <span className="text-xs font-semibold text-royal">
              Package: {wedding?.packageType || 'Full-Service Royal'}
            </span>
          </div>

          <div>
            <h2 className="font-serif text-3xl font-bold text-navy-900">
              Welcome, {wedding?.brideName || 'Rhea'} & {wedding?.groomName || 'Siddharth'}
            </h2>
            <div className="text-xs text-darkText/70 flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                <span>{wedding?.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                <span>{wedding ? new Date(wedding.weddingDate).toLocaleDateString() : 'Confirmed Date'}</span>
              </span>
              <span>•</span>
              <span>{wedding?.guestCount} Guests</span>
            </div>
          </div>
        </div>

        {/* Digital Agreement Section with Signature Pad */}
        <div className="bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-navy-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-royal">
                Legal Service Agreement
              </span>
              <h3 className="font-serif text-2xl font-bold text-navy-900 mt-0.5">
                Digital Agreement & Terms of Service
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

          {/* Agreement Terms Preview Box */}
          <div className="bg-cream-100 p-4 rounded-xl border border-navy-200/80 text-xs font-mono text-darkText/80 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
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
                    className="h-12 border border-green-300 bg-white p-1 rounded"
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

        {/* Live Service Verification Requests (e.g. DJ Check) */}
        {verifications.length > 0 && (
          <div className="bg-white border-2 border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-royal">
              Wedding-Day Service Verification
            </span>
            <h3 className="font-serif text-xl font-bold text-navy-900">
              Confirm Delivered Services
            </h3>

            {verifications.map((v) => (
              <div key={v.id} className="p-4 bg-cream-100 border border-gold/30 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-900 text-sm">{v.serviceName}</span>
                  <span className="font-bold uppercase text-gold-dark">{v.status.replace(/_/g, ' ')}</span>
                </div>

                <p className="text-darkText/80">
                  Has this service been delivered to your satisfaction?
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
      </main>
    </div>
  );
}
