'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Crown,
  Sparkles,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  Clock,
  DollarSign,
  FileCheck,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnquiryModal from '@/components/EnquiryModal';
import BudgetCalculator from '@/components/BudgetCalculator';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Top Luxury Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center text-white overflow-hidden py-24 px-4 sm:px-6 lg:px-8 border-b border-navy-900/40">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/hero-bg.png"
            alt="Hero Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Rich Midnight Navy Overlay: darker in center for readability, preserving warm palace & mandap glow */}
          <div className="absolute inset-0 bg-navy-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-transparent to-navy-950/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-navy-950/50 via-transparent to-navy-950/60" />
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 max-w-5xl mx-auto text-center space-y-8"
        >

          {/* Majestic Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.15] drop-shadow-md">
            Where Imperial Grandeur Meets{' '}
            <span className="text-gold-gradient italic">Precision Operations</span>
          </h1>

          {/* Subheading */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-cream/90 font-normal leading-relaxed drop-shadow-sm">
            The definitive platform for luxury Indian weddings. Streamline multi-channel enquiries, compare vendor quotations side-by-side, auto-generate 25+ lead-time milestone plans, and verify wedding-day services in real-time.
          </p>

          {/* Hero Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-base shadow-gold-glow hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Plan Your Royal Wedding</span>
            </motion.button>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/30 text-white hover:bg-white/10 font-semibold text-base transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <span>Agency & Client Portal</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </Link>
            </motion.div>
          </div>

          {/* Key Metrics Strip */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-white/15 text-left">
            <div className="p-3">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-white">Vendor Selection </div>
              <p className="text-xs text-cream/70 mt-0.5">RFP Quotation Comparison</p>
            </div>
            <div className="p-3">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-white">25+ Tasks</div>
              <p className="text-xs text-cream/70 mt-0.5">Instant Plan Auto-Generator</p>
            </div>
            <div className="p-3">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-white">Live Radar</div>
              <p className="text-xs text-cream/70 mt-0.5">Day-of Vendor Arrival Gate</p>
            </div>
            <div className="p-3">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-white">Audited</div>
              <p className="text-xs text-cream/70 mt-0.5">Service Verification Escrow</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Royal Wedding Packages */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full gold-badge text-xs font-semibold mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>Configurable Packages</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
            Two Bespoke Operations Frameworks
          </h2>
          <p className="text-base text-darkText/75 mt-3 leading-relaxed">
            Every royal celebration has distinct operational demands. We support both end-to-end full planning and precision day-of coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Package 1: Full-Service */}
          <div className="bg-white border-2 border-gold/60 rounded-2xl p-8 sm:p-10 shadow-lg relative flex flex-col justify-between">
            <div className="absolute -top-3.5 right-8 bg-gold-gradient text-navy-950 font-bold text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
              Most Popular Royal Choice
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-navy-900 text-gold flex items-center justify-center mb-6">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-navy-900">Full-Service Royal Wedding</h3>
              <p className="text-sm text-darkText/80 mt-2 leading-relaxed">
                Complete wedding lifecycle management from conceptual moodboard design and heritage venue contracts to 25+ auto-generated lead-time milestones and post-wedding financial reconciliation.
              </p>

              <div className="my-6 border-t border-navy-100" />

              <h4 className="text-xs uppercase tracking-wider font-bold text-royal mb-4">
                Operational Inclusions:
              </h4>
              <ul className="space-y-3 text-sm text-darkText/90">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span><strong>Multliple Vendors System</strong>: Automated RFP matrix for Catering, Decor & Photography</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span><strong>Instant 25+ Task Plan</strong>: Lead-time deadlines calculated dynamically from event date</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span><strong>Digital Agreements</strong>: Canvas digital signatures with verified IP & audit logging</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span><strong>Service Verification System</strong>: Automated DJ, sound & catering sign-offs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span><strong>Post-Wedding Settlement</strong>: Extra plate/hour overage reconciliation & final P&L</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-navy-100">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-navy-900 text-gold font-bold text-sm hover:bg-navy-800 transition-colors flex items-center justify-center gap-2"
              >
                <span>Select Full-Service Package</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Package 2: Partial / Day-of */}
          <div className="bg-white border border-navy-200 rounded-2xl p-8 sm:p-10 shadow-sm flex flex-col justify-between hover:border-gold/60 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-navy-50 text-royal flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-navy-900">Partial / Day-of Wedding</h3>
              <p className="text-sm text-darkText/80 mt-2 leading-relaxed">
                Engineered for couples who have booked key vendors and require battlefield operational execution, master minute-by-minute run-sheets, and vendor arrival management.
              </p>

              <div className="my-6 border-t border-navy-100" />

              <h4 className="text-xs uppercase tracking-wider font-bold text-royal mb-4">
                Operational Inclusions:
              </h4>
              <ul className="space-y-3 text-sm text-darkText/90">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-royal flex-shrink-0 mt-0.5" />
                  <span><strong>Master Day-of Timeline</strong>: Real-time Socket.IO synchronization for Baraat & Pheras</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-royal flex-shrink-0 mt-0.5" />
                  <span><strong>Vendor Arrival Radar</strong>: Real-time tracking of loading gates and delay alerts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-royal flex-shrink-0 mt-0.5" />
                  <span><strong>Family Shadow Liaison</strong>: Dedicated on-ground staff for Bride & Groom families</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-royal flex-shrink-0 mt-0.5" />
                  <span><strong>Service Delivery Protocol</strong>: Instant issue reporting and vendor escalation flow</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-royal flex-shrink-0 mt-0.5" />
                  <span><strong>Event Closure Sign-off</strong>: Venue handover and rental equipment return audit</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-navy-100">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl border border-navy-300 text-navy-900 font-bold text-sm hover:border-gold hover:text-gold-dark transition-colors flex items-center justify-center gap-2"
              >
                <span>Select Partial Coordination</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Spotlight: "Multliple Vendors System" */}
      <section id="workflow" className="py-20 bg-navy-gradient text-white border-y border-gold/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-navy-950/60 text-xs font-semibold text-gold">
                
                <span>Mandatory Core Workflow</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream tracking-tight">
                Multiple Vendors,<br />
                <span className="text-gold-gradient">One System</span>
              </h2>

              <p className="text-base text-cream-200 leading-relaxed">
                Take the guesswork and hidden kickbacks out of wedding vendor selection. For every category—such as 400-guest royal catering—the planner invites 3 verified vendors into a side-by-side comparison matrix.
              </p>

              <div className="space-y-3 text-sm text-cream-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">1</div>
                  <p>Compare per-plate pricing, menu depth, extra-hour rates, and included staff.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">2</div>
                  <p>Planner provides recommendations, but the couple makes the authoritative choice.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">3</div>
                  <p>Selecting the awarded vendor automatically closes competitor requests and binds the contract to the wedding.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all"
                >
                  <span>Experience Comparison Matrix</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Interactive Matrix Card Mockup */}
            <div className="lg:col-span-7 bg-navy-950/90 border border-gold/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gold/20">
                <div>
                  <span className="text-xs uppercase tracking-widest text-gold font-semibold">Live Comparison Matrix</span>
                  <h4 className="font-serif text-lg font-bold text-white">400-Guest Royal Catering RFP</h4>
                </div>
                <span className="text-xs bg-gold/15 text-gold border border-gold/30 px-2.5 py-1 rounded-full font-medium">
                  3 Quotes Received
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                {/* Vendor A */}
                <div className="bg-navy-900 border border-gold/50 rounded-xl p-3.5 space-y-2 relative">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/20 px-2 py-0.5 rounded-full inline-block">
                    ★ Planner Pick
                  </div>
                  <div className="font-bold text-white text-sm">Royal Rajputana Banquets</div>
                  <div className="text-gold font-serif text-base font-bold">₹1,850 <span className="text-[10px] text-cream-300 font-sans">/ plate</span></div>
                  <div className="text-[11px] text-cream-300">Total: ₹13,90,000</div>
                  <div className="border-t border-navy-800 pt-2 space-y-1 text-[11px] text-cream-300">
                    <div>✓ 4 Live Stations</div>
                    <div>✓ 40 White-Glove Butlers</div>
                    <div>✓ Extra Hour: ₹25,000</div>
                  </div>
                  <div className="pt-2">
                    <span className="block text-center text-[10px] font-bold text-navy-950 bg-gold-gradient py-1.5 rounded-md">
                      Selected & Awarded
                    </span>
                  </div>
                </div>

                {/* Vendor B */}
                <div className="bg-navy-900/60 border border-navy-700 rounded-xl p-3.5 space-y-2 opacity-80">
                  <div className="text-[10px] text-cream-400 uppercase tracking-wider">Option B</div>
                  <div className="font-bold text-white text-sm">Saffron & Spice Gourmet</div>
                  <div className="text-cream font-serif text-base font-bold">₹1,600 <span className="text-[10px] text-cream-300 font-sans">/ plate</span></div>
                  <div className="text-[11px] text-cream-300">Total: ₹12,20,000</div>
                  <div className="border-t border-navy-800 pt-2 space-y-1 text-[11px] text-cream-400">
                    <div>✓ 2 Live Stations</div>
                    <div>✓ 25 Standard Servers</div>
                    <div>✓ Extra Hour: ₹18,000</div>
                  </div>
                  <div className="pt-2">
                    <span className="block text-center text-[10px] font-medium text-cream-400 bg-navy-800 py-1.5 rounded-md">
                      Auto-Closed
                    </span>
                  </div>
                </div>

                {/* Vendor C */}
                <div className="bg-navy-900/60 border border-navy-700 rounded-xl p-3.5 space-y-2 opacity-80">
                  <div className="text-[10px] text-cream-400 uppercase tracking-wider">Option C</div>
                  <div className="font-bold text-white text-sm">The Golden Spoon Feast</div>
                  <div className="text-cream font-serif text-base font-bold">₹2,200 <span className="text-[10px] text-cream-300 font-sans">/ plate</span></div>
                  <div className="text-[11px] text-cream-300">Total: ₹16,00,000</div>
                  <div className="border-t border-navy-800 pt-2 space-y-1 text-[11px] text-cream-400">
                    <div>✓ 6 Molecular Stations</div>
                    <div>✓ 50 Silverware Staff</div>
                    <div>✓ Extra Hour: ₹35,000</div>
                  </div>
                  <div className="pt-2">
                    <span className="block text-center text-[10px] font-medium text-cream-400 bg-navy-800 py-1.5 rounded-md">
                      Auto-Closed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Spotlight: Service Verification System */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream-200 border border-gold/40 rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full gold-badge text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Operational Accountability</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-navy-900">
                Service Verification & Escrow Protection
              </h2>
              <p className="text-sm text-darkText/80 leading-relaxed">
                Important milestones are never assumed to have happened. When a scheduled service arrives—for example, the <strong>DJ scheduled at 7:00 PM</strong>—the system prompts both the Client and On-Ground Staff for instant confirmation.
              </p>
              <div className="space-y-2.5 text-xs text-darkText/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Four clear responses: Completed, Incomplete, Not Delivered, Report Issue.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Direct photo/evidence upload with auditable dispute timestamps.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Vendor rebuttal and agreed resolution workflow prior to final settlement.</span>
                </div>
              </div>
            </div>

            {/* Verification Prompt UI Mock */}
            <div className="lg:col-span-6 bg-white border-2 border-gold rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                    Service Verification Alert
                  </span>
                </div>
                <span className="text-[11px] text-darkText/60">Scheduled: 7:00 PM</span>
              </div>

              <div>
                <h4 className="font-serif text-base font-bold text-navy-900">
                  DJ Shadow & Sonic Symphony – 7:00 PM Setup
                </h4>
                <p className="text-xs text-darkText/70 mt-1">
                  Has the DJ service started and met the agreed acoustic specifications?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <div className="p-2.5 rounded-lg bg-green-50 text-green-800 border border-green-200 text-center flex items-center justify-center gap-1.5 cursor-pointer">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Yes, Completed</span>
                </div>
                <div className="p-2.5 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 text-center flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Started Incomplete</span>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50 text-red-800 border border-red-200 text-center flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Not Delivered</span>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-900 text-gold border border-gold text-center flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Report an Issue</span>
                </div>
              </div>

              <div className="text-[11px] text-darkText/60 bg-cream-100 p-2.5 rounded-lg border border-navy-100">
                Audit Status: <strong>Awaiting Confirmation</strong> | Verifier: Client or Coordinator Rohan Mehra
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Budget Estimator Component */}
      <BudgetCalculator />

      {/* Heritage Venues Showcase */}
      <section id="venues" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full gold-badge text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Curated Heritage Citadels</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
            Iconic Palaces & Island Banquets
          </h2>
          <p className="text-base text-darkText/75 mt-3">
            Grand Bandhan manages full logistics across India&apos;s finest royal heritage destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Jagmandir Island Palace',
              location: 'Lake Pichola, Udaipur',
              capacity: 'Up to 600 Guests',
              desc: 'Floating marble palace with 360° lake vistas and private boat arrivals for the royal Baraat.',
              tag: 'Featured Flagship',
            },
            {
              title: 'Rambagh Palace',
              location: 'Jaipur, Rajasthan',
              capacity: 'Up to 1,000 Guests',
              desc: 'Former residence of the Maharaja of Jaipur with 47 acres of manicured Mughal gardens and peacocks.',
              tag: 'Royal Heritage',
            },
            {
              title: 'Taj Falaknuma Palace',
              location: 'Hyderabad, Telangana',
              capacity: 'Up to 450 Guests',
              desc: 'Elevated scorpion-shaped palace with Venetian chandeliers, Nizam opulence, and horse-drawn carriages.',
              tag: 'Imperial Grandeur',
            },
          ].map((venue, idx) => (
            <div key={idx} className="bg-white border border-gold/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/30 px-3 py-1 rounded-full inline-block">
                {venue.tag}
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-900">{venue.title}</h3>
              <div className="text-xs font-semibold text-royal flex items-center gap-1.5">
                <span>{venue.location}</span> • <span>{venue.capacity}</span>
              </div>
              <p className="text-xs text-darkText/80 leading-relaxed">{venue.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-navy-900 text-white py-16 px-4 border-t border-gold/40">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream">
            Begin Your Royal Journey with Grand Bandhan
          </h2>
          <p className="text-sm sm:text-base text-cream-300 max-w-xl mx-auto leading-relaxed">
            Experience uncompromised luxury and bulletproof operations. Submit an enquiry or sign in to your wedding command portal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all"
            >
              Submit Wedding Enquiry
            </button>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl border border-gold/40 text-gold hover:bg-gold/15 font-semibold text-sm transition-colors"
            >
              Sign In to Command Center &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Interactive Modal */}
      <EnquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
