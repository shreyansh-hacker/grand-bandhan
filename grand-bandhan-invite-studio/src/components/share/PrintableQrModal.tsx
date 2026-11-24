import React, { useRef } from 'react';
import { InvitationDraft } from '../../types/invitation';
import { X, QrCode, Download, Sparkles, Printer } from 'lucide-react';
import { useLanguage } from '../../locales';

interface PrintableQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: InvitationDraft;
}

export const PrintableQrModal: React.FC<PrintableQrModalProps> = ({
  isOpen,
  onClose,
  draft,
}) => {
  const { lang } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const data = draft.publishedData || draft.data || {};
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://grand-bandhan-theta.vercel.app';
  const inviteUrl = `${origin}/i/${draft.slug}`;

  const coupleOrTitle = data.title ||
    (data.groomName && data.brideName
      ? `${data.groomName} & ${data.brideName}`
      : draft.name);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&color=6e-1f-2f&bgcolor=faf-7f-2&data=${encodeURIComponent(inviteUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrImageUrl;
    a.download = `qr-code-${draft.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#faf7f2] rounded-3xl shadow-2xl border-2 border-[#c9a96a]/50 overflow-hidden">
        {/* Top Accent */}
        <div className="h-2 bg-gradient-to-r from-[#6e1f2f] via-[#c9a96a] to-[#6e1f2f]" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7c6f64] hover:text-[#2c2523] rounded-full hover:bg-black/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ede2] text-[#8b7355] text-xs font-semibold uppercase tracking-wider mb-3">
            <QrCode className="w-3.5 h-3.5 text-[#c9a96a]" />
            <span>{lang === 'hi' ? 'प्रिंट योग्य वेडिंग कार्ड इंसर्ट' : 'Printable Wedding Card Insert'}</span>
          </div>

          <h3 className="font-serif text-2xl font-bold text-[#6e1f2f]">
            {coupleOrTitle}
          </h3>
          <p className="text-xs text-[#7c6f64] mt-0.5">
            {lang === 'hi' ? 'मिठाई के डिब्बों या भौतिक शादी पत्रिकाओं पर लगाने हेतु' : 'For sweet boxes, envelope inserts, or physical invitations'}
          </p>

          {/* Printable Gold Crested QR Frame */}
          <div
            ref={cardRef}
            className="my-5 p-5 bg-[#fffefb] rounded-2xl border-2 border-[#c9a96a] shadow-md inline-block relative max-w-xs mx-auto"
          >
            {/* Corner Ornaments */}
            <div className="absolute top-1 left-1 text-[#c9a96a] text-xs">❖</div>
            <div className="absolute top-1 right-1 text-[#c9a96a] text-xs">❖</div>
            <div className="absolute bottom-1 left-1 text-[#c9a96a] text-xs">❖</div>
            <div className="absolute bottom-1 right-1 text-[#c9a96a] text-xs">❖</div>

            <p className="font-serif text-xs font-semibold text-[#8b7355] tracking-widest uppercase mb-2">
              GRAND BANDHAN
            </p>

            <img
              src={qrImageUrl}
              alt={`QR Code for ${draft.slug}`}
              className="w-48 h-48 mx-auto rounded-lg border border-[#c9a96a]/30 p-2 bg-white"
            />

            <p className="font-serif text-xs font-medium text-[#6e1f2f] mt-3">
              {lang === 'hi' ? '3D डिजिटल निमंत्रण देखने के लिए स्कैन करें' : 'Scan to Open 3D Wedding Book'}
            </p>
            <p className="text-[10px] text-[#a89984] mt-0.5 font-mono">
              /i/{draft.slug}
            </p>
          </div>

          {/* Download & Print Actions */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="py-2.5 px-4 bg-gradient-to-r from-[#6e1f2f] to-[#8a273c] text-white font-medium text-xs sm:text-sm rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'hi' ? 'QR कोड डाउनलोड करें' : 'Download QR PNG'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-4 bg-white border border-[#c9a96a] text-[#6e1f2f] font-medium text-xs sm:text-sm rounded-xl hover:bg-[#c9a96a]/10 transition-all flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'hi' ? 'प्रिंट करें' : 'Print Card'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
