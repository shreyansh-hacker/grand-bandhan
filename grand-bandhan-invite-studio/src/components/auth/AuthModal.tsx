import React, { useState } from 'react';
import { UserAccount, loginUser } from '../../services/storage';
import { X, Lock, Mail, Phone, User, Sparkles, CheckCircle2, Crown, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../locales';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  subtitle,
}) => {
  const { lang } = useLanguage();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('host');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !name.trim()) {
      setError(lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Please enter your full name');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError(lang === 'hi' ? 'कृपया ईमेल या मोबाइल नंबर दर्ज करें' : 'Please enter email or phone number');
      return;
    }

    const hostName = name.trim() || email.split('@')[0] || 'Event Host';
    const user = loginUser(hostName, email.trim() || `${phone.replace(/\D/g, '')}@grandbandhan.com`, phone.trim(), 'free');
    onSuccess(user);
    onClose();
  };

  const handleDemoHost = () => {
    const demoUser = loginUser('Shreyansh Sharma', 'shreyansh@grandbandhan.com', '+91 98765 43210', 'free');
    onSuccess(demoUser);
    onClose();
  };

  const handleRoyalDemoHost = () => {
    const royalUser = loginUser('Kabir & Meera (Royal Family)', 'royal.wedding@grandbandhan.com', '+91 98111 22334', 'royal');
    onSuccess(royalUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#faf7f2] rounded-2xl shadow-2xl border-2 border-[#c9a96a]/40 overflow-hidden">
        {/* Ornate Header Pattern */}
        <div className="h-2 bg-gradient-to-r from-[#6e1f2f] via-[#c9a96a] to-[#6e1f2f]" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#7c6f64] hover:text-[#2c2523] rounded-full hover:bg-black/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand Emblem */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a96a]/20 to-[#6e1f2f]/10 border border-[#c9a96a]/40 flex items-center justify-center mb-3 text-[#6e1f2f]">
              <Lock className="w-6 h-6 text-[#c9a96a]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#6e1f2f] tracking-wide">
              {title || (lang === 'hi' ? 'ग्रैंड बंधन स्टूडियो में प्रवेश करें' : 'Sign in to Invite Studio')}
            </h2>
            <p className="text-xs sm:text-sm text-[#7c6f64] mt-1 font-sans">
              {subtitle ||
                (lang === 'hi'
                  ? 'अपने आमंत्रण सहेजने, लाइव प्रकाशित करने और मेहमानों के RSVP देखने के लिए लॉगिन करें'
                  : 'Manage your drafts, publish live 3D invites, and track real-time guest RSVPs')}
            </p>
          </div>

          {/* Quick Demo Logins for instant trial without typing */}
          <div className="mb-6 p-3.5 bg-[#f3ede2] rounded-xl border border-[#c9a96a]/30">
            <p className="text-xs font-semibold text-[#8b7355] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a96a]" />
              {lang === 'hi' ? '1-क्लिक त्वरित शुरुआत (परीक्षण)' : 'Instant 1-Click Access (Testing)'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoHost}
                className="px-3 py-2 text-xs font-medium text-[#2c2523] bg-white rounded-lg border border-[#c9a96a]/40 hover:border-[#6e1f2f] hover:bg-gold/5 transition-all text-left flex items-center justify-between"
              >
                <span>Free Host (Shreyansh)</span>
                <ArrowRight className="w-3 h-3 text-[#c9a96a]" />
              </button>
              <button
                type="button"
                onClick={handleRoyalDemoHost}
                className="px-3 py-2 text-xs font-semibold text-[#6e1f2f] bg-white rounded-lg border border-[#c9a96a] hover:bg-[#6e1f2f]/5 transition-all text-left flex items-center justify-between"
              >
                <span className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-[#c9a96a]" /> Royal Pass
                </span>
                <ArrowRight className="w-3 h-3 text-[#c9a96a]" />
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-[#e2d7c5] mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`flex-1 pb-2.5 text-sm font-medium transition-colors border-b-2 ${
                mode === 'signin'
                  ? 'border-[#6e1f2f] text-[#6e1f2f] font-semibold'
                  : 'border-transparent text-[#7c6f64] hover:text-[#2c2523]'
              }`}
            >
              {lang === 'hi' ? 'लॉग इन करें' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 pb-2.5 text-sm font-medium transition-colors border-b-2 ${
                mode === 'signup'
                  ? 'border-[#6e1f2f] text-[#6e1f2f] font-semibold'
                  : 'border-transparent text-[#7c6f64] hover:text-[#2c2523]'
              }`}
            >
              {lang === 'hi' ? 'नया खाता बनाएँ' : 'Create Account'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-[#7c6f64] mb-1">
                  {lang === 'hi' ? 'आपका नाम' : 'Your Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#a89984]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. कबीर शर्मा' : 'e.g. Kabir Sharma'}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#d5c7b3] rounded-lg focus:outline-none focus:border-[#6e1f2f] focus:ring-1 focus:ring-[#6e1f2f]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#7c6f64] mb-1">
                {lang === 'hi' ? 'ईमेल पता' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#a89984]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="host@grandbandhan.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#d5c7b3] rounded-lg focus:outline-none focus:border-[#6e1f2f] focus:ring-1 focus:ring-[#6e1f2f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7c6f64] mb-1">
                {lang === 'hi' ? 'मोबाइल नंबर (वैकल्पिक)' : 'Mobile Phone (Optional)'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-[#a89984]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#d5c7b3] rounded-lg focus:outline-none focus:border-[#6e1f2f] focus:ring-1 focus:ring-[#6e1f2f]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-[#6e1f2f] to-[#8a273c] text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{mode === 'signin' ? (lang === 'hi' ? 'साइन इन करें' : 'Sign In & Continue') : (lang === 'hi' ? 'खाता बनाएँ' : 'Create Free Account')}</span>
            </button>
          </form>

          {/* Privacy Note */}
          <p className="mt-4 text-center text-[11px] text-[#a89984]">
            {lang === 'hi'
              ? 'आपके कार्ड और मेहमानों की जानकारी सुरक्षित एवं निजी रहती है।'
              : 'Your drafts and guest RSVP responses are securely encrypted and private.'}
          </p>
        </div>
      </div>
    </div>
  );
};
