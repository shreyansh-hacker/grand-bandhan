import React from 'react';
import Link from 'next/link';
import { Crown, Heart, Mail, Phone, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-cream border-t border-gold/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-navy-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-gradient p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-navy-900 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-gold" />
                </div>
              </div>
              <span className="font-serif text-2xl font-bold tracking-wider text-gold-gradient">
                GRAND BANDHAN
              </span>
            </div>
            <p className="text-sm text-cream-300 leading-relaxed">
              India&apos;s foremost imperial wedding operations platform. Bringing precision, elegance, and end-to-end transparency to luxury royal weddings.
            </p>
            <div className="pt-2 text-xs text-gold flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified Escrow & Digital Signatures Enabled
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-gold mb-4">Operations Engine</h4>
            <ul className="space-y-2.5 text-sm text-cream-300">
              <li>
                <Link href="/dashboard/enquiries" className="hover:text-gold transition-colors">
                  Multi-Channel Enquiries
                </Link>
              </li>
              <li>
                <Link href="/dashboard/quotations" className="hover:text-gold transition-colors">
                  Three Vendors, One Decision
                </Link>
              </li>
              <li>
                <Link href="/dashboard/weddings" className="hover:text-gold transition-colors">
                  Instant 25+ Task Planner
                </Link>
              </li>
              <li>
                <Link href="/dashboard/events" className="hover:text-gold transition-colors">
                  Live Event & Vendor Arrival
                </Link>
              </li>
              <li>
                <Link href="/dashboard/verification" className="hover:text-gold transition-colors">
                  Service Verification System
                </Link>
              </li>
              <li>
                <Link href="/dashboard/payments" className="hover:text-gold transition-colors">
                  Post-Wedding Settlement
                </Link>
              </li>
            </ul>
          </div>

          {/* Palace Destinations */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-gold mb-4">Royal Destinations</h4>
            <ul className="space-y-2.5 text-sm text-cream-300">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Udaipur – Lake & Island Palaces</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Jaipur – Royal Forts & Havelis</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Jodhpur – Sun City Grand Citadels</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Hyderabad – Nizam Pearl Estates</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Goa – Coastal Heritage Mansions</span>
              </li>
            </ul>
          </div>

          {/* Concierge Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-gold mb-4">Imperial Concierge</h4>
            <div className="space-y-3 text-sm text-cream-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span>The Imperial Pavilion, Umaid Heritage Enclave, Udaipur, Rajasthan 313001</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <span>+91 98200 12345 / +91 98200 54321</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <span>concierge@grandbandhan.com</span>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-block text-xs uppercase tracking-wider font-semibold text-gold border border-gold/40 px-3 py-1.5 rounded hover:bg-gold hover:text-navy-950 transition-all"
                >
                  Enter Portal &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-400 gap-4">
          <p>© {new Date().getFullYear()} Grand Bandhan Technologies. All rights reserved. Built with Imperial Blue & Gold.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gold transition-colors">Privacy Charter</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">Terms of Heritage Service</Link>
            <Link href="/security" className="hover:text-gold transition-colors">RBAC & Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
