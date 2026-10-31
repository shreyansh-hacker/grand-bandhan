'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Bell, CheckCheck, Clock, ShieldAlert, AlertTriangle, CreditCard, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import { AppNotificationItem, NotificationCategory } from '@grand-bandhan/shared';

const CATEGORIES = [
  { key: 'ALL', label: 'All Notices', icon: Bell },
  { key: NotificationCategory.SERVICE_VERIFICATION, label: 'Verifications', icon: ShieldAlert },
  { key: NotificationCategory.VENDOR_DELAY, label: 'Vendor Delays', icon: AlertTriangle },
  { key: NotificationCategory.PAYMENT_DUE, label: 'Payments', icon: CreditCard },
  { key: NotificationCategory.WEDDING_TIMELINE, label: 'Ceremonies', icon: Calendar },
  { key: NotificationCategory.TASK_DEADLINE, label: 'Tasks', icon: CheckSquare },
  { key: NotificationCategory.COMPLAINT, label: 'Complaints', icon: MessageSquare },
  { key: NotificationCategory.ESCALATION, label: 'Escalations', icon: AlertTriangle },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (cat = selectedCategory) => {
    setLoading(true);
    try {
      const catQuery = cat && cat !== 'ALL' ? `?category=${cat}` : '';
      const res: any = await apiRequest(`/api/notifications${catQuery}`);
      if (res.success && res.data) {
        setNotifications(res.data);
        if (typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [selectedCategory]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await apiRequest('/api/notifications/mark-all-read', { method: 'POST' });
  };

  const getBadgeClass = (category: string) => {
    switch (category) {
      case NotificationCategory.SERVICE_VERIFICATION:
      case NotificationCategory.ESCALATION:
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case NotificationCategory.VENDOR_DELAY:
      case NotificationCategory.COMPLAINT:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case NotificationCategory.PAYMENT_DUE:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case NotificationCategory.WEDDING_TIMELINE:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-cream-100/10 text-cream-200 border-cream-200/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-900/80 via-navy-950/90 to-navy-900/80 border border-gold/30 shadow-gold-glow">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gold">
            Royal Notification Desk
          </h2>
          <p className="text-xs sm:text-sm text-cream-300">
            {unreadCount > 0 ? `${unreadCount} unread imperial alerts` : 'All notifications read'}
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-gold/40 text-gold hover:bg-gold/10 font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <CheckCheck className="w-4 h-4" />
          Mark All Read
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-gold-gradient text-navy-950 border-gold shadow-gold-glow'
                  : 'bg-navy-900/60 text-cream-300 border-gold/20 hover:border-gold/40 hover:bg-navy-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-navy-900/40 border border-gold/10 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-navy-900/40 border border-gold/20">
            <Bell className="w-10 h-10 text-gold/40 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-cream-100 text-base mb-1">
              No Notices in this Category
            </h3>
            <p className="text-xs text-cream-400">
              Your royal radar is completely clear. Any upcoming timeline checkpoints or verifications will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                !n.isRead
                  ? 'bg-navy-900/90 border-gold/50 shadow-gold-glow'
                  : 'bg-navy-900/40 border-gold/10 hover:border-gold/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeClass(n.category)}`}>
                    {n.category.replace(/_/g, ' ')}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-cream-400">
                  <Clock className="w-3 h-3" />
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <h4 className={`text-sm font-semibold mb-1 ${!n.isRead ? 'text-gold' : 'text-cream-100'}`}>
                {n.title}
              </h4>
              <p className="text-xs text-cream-300 leading-relaxed">
                {n.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
