'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Save,
  Key,
  Crown,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState({
    transactionalEmails: true,
    weddingUpdates: true,
    paymentAlerts: true,
    taskAlerts: true,
    marketingEmails: false,
  });

  // Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Preferences State
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, prefRes] = await Promise.all([
          apiRequest('/api/profile/me'),
          apiRequest('/api/profile/preferences'),
        ]);

        if (profRes.success && profRes.data) {
          setProfile(profRes.data);
          setName(profRes.data.name || '');
          setPhone(profRes.data.phone || '');
          setDepartment(profRes.data.department || '');
          setSpecialization(profRes.data.specialization || '');
        }

        if (prefRes.success && prefRes.data) {
          setPreferences({
            transactionalEmails: prefRes.data.transactionalEmails ?? true,
            weddingUpdates: prefRes.data.weddingUpdates ?? true,
            paymentAlerts: prefRes.data.paymentAlerts ?? true,
            taskAlerts: prefRes.data.taskAlerts ?? true,
            marketingEmails: prefRes.data.marketingEmails ?? false,
          });
        }
      } catch (err: any) {
        console.error('Failed to load profile data', err);
      }
    }

    loadData();
  }, []);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await apiRequest('/api/profile/me', {
        method: 'PATCH',
        body: JSON.stringify({ name, phone, department, specialization }),
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setProfileSuccess('Profile updated successfully.');
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('gb_user');
          if (stored) {
            const user = JSON.parse(stored);
            user.name = res.data.name;
            localStorage.setItem('gb_user', JSON.stringify(user));
          }
        }
      } else {
        setProfileError(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Error communicating with server.');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true);
    setPwSuccess('');
    setPwError('');

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      setPwLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/api/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      if (res.success) {
        setPwSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwError(res.message || 'Failed to change password.');
      }
    } catch (err: any) {
      setPwError(err.message || 'Error communicating with server.');
    } finally {
      setPwLoading(false);
    }
  }

  async function handlePreferenceToggle(key: keyof typeof preferences) {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    setPrefLoading(true);
    setPrefSuccess('');

    try {
      const res = await apiRequest('/api/profile/preferences', {
        method: 'PATCH',
        body: JSON.stringify(updated),
      });

      if (res.success) {
        setPrefSuccess('Notification preferences saved.');
        setTimeout(() => setPrefSuccess(''), 3000);
      }
    } catch (err: any) {
      console.error('Failed to update preferences', err);
    } finally {
      setPrefLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Title */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
          Profile & Account Settings
        </h2>
        <p className="text-xs text-darkText/70 mt-1 uppercase tracking-widest font-semibold">
          Role Permissions, Personal Contact Details & Notification Matrix
        </p>
      </div>

      {/* Account Badge Card */}
      <div className="bg-navy-950 text-cream p-6 rounded-2xl border border-gold/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold-gradient text-navy-950 font-black text-2xl flex items-center justify-center shadow-gold-glow">
            {profile?.name ? profile.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-cream">{profile?.name || 'Loading...'}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold text-navy-950">
                {profile?.role || 'OFFICIAL'}
              </span>
            </div>
            <p className="text-xs text-cream-300 mt-0.5">{profile?.email}</p>
            <p className="text-[11px] text-gold-light mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Agency: {profile?.agency?.name || 'Grand Bandhan Imperial'}</span>
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Account: {profile?.accountStatus || 'ACTIVE'}
          </span>
          <span className="text-[10px] text-cream-400">
            Persistent on Neon PostgreSQL
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Edit Profile Details */}
        <div className="bg-white border border-navy-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-navy-100 pb-3">
            <User className="w-5 h-5 text-gold-dark" />
            <h3 className="font-serif text-lg font-bold text-navy-900">Personal & Role Profile</h3>
          </div>

          {profileSuccess && (
            <div className="p-3 text-xs bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 text-xs bg-red-50 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Operations"
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-darkText mb-1">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Heritage Palaces"
                  className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-gradient text-navy-950 font-bold text-xs shadow-gold-glow hover:brightness-105 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white border border-navy-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-navy-100 pb-3">
            <Key className="w-5 h-5 text-gold-dark" />
            <h3 className="font-serif text-lg font-bold text-navy-900">Security & Password</h3>
          </div>

          {pwSuccess && (
            <div className="p-3 text-xs bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div className="p-3 text-xs bg-red-50 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">New Password (Min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-darkText mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:border-gold"
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy-900 text-gold font-bold text-xs hover:bg-navy-800 transition-colors disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{pwLoading ? 'Updating Hash...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Centralized Email Notification Preferences */}
      <div className="bg-white border border-navy-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-navy-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gold-dark" />
            <div>
              <h3 className="font-serif text-lg font-bold text-navy-900">
                Email Notification Matrix (Resend Transactional Outbox)
              </h3>
              <p className="text-xs text-darkText/70">
                Configure which transactional and operational lifecycle emails you receive from Grand Bandhan.
              </p>
            </div>
          </div>
          {prefSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {prefSuccess}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[
            {
              key: 'transactionalEmails' as const,
              title: 'Transactional Account Emails',
              desc: 'Crucial account alerts, password changes & agency approval decisions.',
            },
            {
              key: 'weddingUpdates' as const,
              title: 'Wedding Milestone Updates',
              desc: 'Enquiry assignments, proposal status changes & booking confirmations.',
            },
            {
              key: 'paymentAlerts' as const,
              title: 'Payment & Milestone Alerts',
              desc: 'Client milestone receipts, overdue reminders & final settlement sign-offs.',
            },
            {
              key: 'taskAlerts' as const,
              title: 'Task Assignment Notifications',
              desc: 'Automatic 26-task plan updates and daily lead-time schedule cues.',
            },
            {
              key: 'marketingEmails' as const,
              title: 'Platform Enhancements & News',
              desc: 'Periodic product release updates and luxury wedding best practice guides.',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="p-4 rounded-xl border border-navy-200 bg-navy-50/50 flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-navy-950">{item.title}</p>
                <p className="text-[11px] text-darkText/70 mt-1 leading-snug">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={preferences[item.key]}
                onChange={() => handlePreferenceToggle(item.key)}
                className="mt-0.5 accent-navy-900 w-4 h-4 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
