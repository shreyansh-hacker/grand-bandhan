import React from 'react';
import { UserAccount, updateUserTier } from '../../services/storage';
import { X, Crown, Check, Sparkles, ShieldCheck, Music, QrCode, MessageSquare, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../locales';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUpgraded: (user: UserAccount) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgraded,
}) => {
  const { lang } = useLanguage();

  if (!isOpen) return null;

  const handleUpgrade = (tier: 'royal') => {
    const updated = updateUserTier(tier);

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c9a96a', '#6e1f2f', '#d4af37', '#ffffff'],
      });
    } catch {}

    onUpgraded(updated);
    onClose();
  };

  const isAlreadyRoyal = user.tier === 'royal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#faf7f2] rounded-3xl shadow-2xl border-2 border-[#c9a96a]/50 overflow-hidden my-8">
        {/* Ornate Gold Banner */}
        <div className="bg-gradient-to-r from-[#6e1f2f] via-[#c9a96a] to-[#6e1f2f] p-6 text-center text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-gold-light border border-white/20 text-xs font-serif uppercase tracking-widest mb-2">
            <Crown className="w-3.5 h-3.5 text-[#f9df9b]" />
            {lang === 'hi' ? 'शाही अपग्रेड · VIP पास' : 'Imperial Upgrade · Royal Pass'}
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">
            {lang === 'hi' ? 'ग्रैंड बंधन रॉयल मेंबरशिप' : 'Grand Bandhan Royal Membership'}
          </h2>
          <p className="text-xs sm:text-sm text-white/85 mt-1 max-w-lg mx-auto font-sans">
            {lang === 'hi'
              ? 'असीमित 3D आमंत्रण, वॉटरमार्क-मुक्त डिज़ाइन, लाइव RSVP प्रबंधन और कस्टम संगीत'
              : 'Unlock unlimited luxury 3D invitations, watermark-free stationery, unlimited RSVPs, and custom audio.'}
          </p>
        </div>

        {/* Pricing Cards Comparison */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Free Plan */}
            <div className={`p-5 rounded-2xl border ${user.tier === 'free' ? 'border-[#c9a96a] bg-white shadow-sm ring-2 ring-[#c9a96a]/20' : 'border-[#e0d6c4] bg-[#fbf9f5]'} flex flex-col justify-between`}>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-serif text-lg font-bold text-[#2c2523]">
                    {lang === 'hi' ? 'मुफ़्त योजना' : 'Free Starter'}
                  </h3>
                  {user.tier === 'free' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#d5c7b3]/40 text-[#7c6f64]">
                      {lang === 'hi' ? 'सक्रिय' : 'Current Plan'}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-[#6e1f2f] mb-4">
                  ₹0 <span className="text-xs font-normal text-[#7c6f64]">/ forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#5c504a]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>1 Active Published Card</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>All 4 Interactive 3D Templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Up to 25 Guest RSVPs</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#a89984]">
                    <span className="w-4 h-4 text-center leading-4 font-bold text-xs">-</span>
                    <span>Includes Grand Bandhan Badge</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#a89984]">
                    <span className="w-4 h-4 text-center leading-4 font-bold text-xs">-</span>
                    <span>Standard Music Tracks Only</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f0e6d6]">
                <button
                  disabled
                  className="w-full py-2 px-3 text-xs font-medium text-[#7c6f64] bg-[#f3ede2] rounded-xl cursor-default text-center"
                >
                  {user.tier === 'free' ? (lang === 'hi' ? 'वर्तमान में सक्रिय' : 'Currently Active') : (lang === 'hi' ? 'मुफ़्त टियर' : 'Free Tier')}
                </button>
              </div>
            </div>

            {/* 2. Royal Premium Plan */}
            <div className="p-5 rounded-2xl border-2 border-[#c9a96a] bg-gradient-to-b from-[#fffefc] to-[#fbf6eb] shadow-lg relative flex flex-col justify-between">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#c9a96a] to-[#d4af37] text-white text-[10px] font-bold uppercase tracking-wider shadow">
                {lang === 'hi' ? 'सबसे लोकप्रिय' : 'Recommended'}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-serif text-lg font-bold text-[#6e1f2f] flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-[#c9a96a]" />
                    {lang === 'hi' ? 'रॉयल वेडिंग पास' : 'Royal Wedding Pass'}
                  </h3>
                </div>
                <div className="text-2xl font-bold text-[#6e1f2f] mb-4">
                  ₹1,499 <span className="text-xs font-normal text-[#7c6f64]">/ event lifetime</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#443833]">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-[#c9a96a] flex-shrink-0" />
                    <span><strong>100% Watermark-Free</strong> Luxury Stationery</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-[#c9a96a] flex-shrink-0" />
                    <span><strong>Unlimited</strong> Guests & Family RSVPs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#c9a96a] flex-shrink-0" />
                    <span><strong>Custom Music</strong> Upload & Shehnai Audio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#c9a96a] flex-shrink-0" />
                    <span><strong>Printable Gold QR Code</strong> for Cards / Mithai Boxes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#c9a96a] flex-shrink-0" />
                    <span><strong>WhatsApp Instant Broadcast Kit</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c9a96a] flex-shrink-0" />
                    <span><strong>Unlimited AI Royal Poet</strong> Copywriting</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f0e6d6]">
                {isAlreadyRoyal ? (
                  <div className="w-full py-2.5 px-4 bg-emerald-600 text-white text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'रॉयल पास सक्रिय है' : 'Royal Pass is Active!'}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpgrade('royal')}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#6e1f2f] via-[#8a273c] to-[#6e1f2f] hover:from-[#591624] hover:to-[#741f31] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4 text-[#f9df9b]" />
                    <span>{lang === 'hi' ? 'रॉयल पास एक्टिवेट करें (₹1,499)' : 'Activate Royal Pass (₹1,499)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#7c6f64]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#c9a96a]" />
              <span>100% Satisfaction Guarantee</span>
            </span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-[#c9a96a]" />
              <span>Live Support by Grand Bandhan Concierge</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
