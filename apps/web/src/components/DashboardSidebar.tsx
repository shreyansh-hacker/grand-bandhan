'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Crown,
  FileSpreadsheet,
  CheckSquare,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  UserCircle,
  LogOut,
  ChevronRight,
  Bell,
} from 'lucide-react';

const NAVIGATION_ITEMS = [
  { label: 'Executive Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Notification Inbox', href: '/dashboard/notifications', icon: Bell },
  { label: 'Enquiries & CRM', href: '/dashboard/enquiries', icon: Users, badge: 'Bride/Groom' },
  { label: 'Weddings Directory', href: '/dashboard/weddings', icon: Crown },
  { label: '3-Vendor Quotations', href: '/dashboard/quotations', icon: FileSpreadsheet, badge: 'Core' },
  { label: 'Instant Task Planner', href: '/dashboard/tasks', icon: CheckSquare, badge: '25+ Auto' },
  { label: 'Live Day-of Timeline', href: '/dashboard/events', icon: Clock },
  { label: 'Service Verification', href: '/dashboard/verification', icon: ShieldCheck },
  { label: 'Payments & Settlement', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Vendor Directory', href: '/dashboard/vendors', icon: Building },
  { label: 'Profile & Settings', href: '/dashboard/profile', icon: UserCircle },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gb_access_token');
      localStorage.removeItem('gb_user');
      window.location.href = '/login';
    }
  }

  return (
    <aside className="w-64 bg-navy-950 text-cream flex flex-col border-r border-gold/30 h-screen sticky top-0 flex-shrink-0">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-gold/20 gap-3">
        <div className="w-10 h-10 rounded-full bg-gold-gradient p-0.5 shadow-gold-glow flex items-center justify-center">
          <div className="w-full h-full bg-navy-900 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-gold" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-lg font-bold tracking-wider text-gold-gradient">
            GRAND BANDHAN
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-cream-300">
            Operations Center
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gold-gradient text-navy-950 shadow-gold-glow font-bold'
                  : 'text-cream-200 hover:bg-navy-900 hover:text-gold'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-navy-950' : 'text-gold'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isActive ? 'bg-navy-950 text-gold' : 'bg-gold/20 text-gold'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile / Logout */}
      <div className="p-4 border-t border-gold/20 bg-navy-900/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-cream-300 hover:text-red-400 hover:bg-navy-950 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Sign Out of Portal</span>
        </button>
      </div>
    </aside>
  );
}
