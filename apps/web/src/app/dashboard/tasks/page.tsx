'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckSquare,

  Calendar,
  AlertCircle,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { TaskStatus, TaskPriority } from '@grand-bandhan/shared';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [wedding, setWedding] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [regenerating, setRegenerating] = useState(false);

  async function loadTasks() {
    try {
      const wRes = await apiRequest('/api/weddings');
      if (wRes.success && wRes.data && wRes.data.length > 0) {
        const w = wRes.data[0];
        setWedding(w);
        const tRes = await apiRequest(`/api/tasks?weddingId=${w.id}`);
        if (tRes.success && tRes.data) {
          setTasks(tRes.data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    try {
      const res = await apiRequest(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRegenerate() {
    if (!wedding) return;
    if (!confirm('Regenerate 25+ tasks based on wedding date and lead times?')) return;

    setRegenerating(true);
    try {
      const res = await apiRequest('/api/tasks/regenerate', {
        method: 'POST',
        body: JSON.stringify({ weddingId: wedding.id }),
      });
      if (res.success) {
        alert(res.message);
        loadTasks();
      }
    } catch (e: any) {
      alert(e.message || 'Error regenerating');
    } finally {
      setRegenerating(false);
    }
  }

  const categories = Array.from(new Set(tasks.map((t) => t.category)));

  const filtered = tasks.filter((t) => {
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    return true;
  });

  const doneCount = tasks.filter((t) => t.status === TaskStatus.DONE).length;
  const inProgressCount = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const toPlanCount = tasks.filter((t) => t.status === TaskStatus.TO_PLAN).length;
  const blockedCount = tasks.filter((t) => t.status === TaskStatus.BLOCKED).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <CheckSquare className="w-4 h-4 text-gold-dark" />
            <span>Instant Planning Engine</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            25+ Automated Milestone Task Board
          </h2>
          <p className="text-xs text-darkText/70">
            Tasks dynamically generated with lead-time countdowns calculated from wedding date: <strong>{wedding ? new Date(wedding.weddingDate).toLocaleDateString() : 'Active Wedding'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-4 py-2 rounded-xl border border-gold text-gold-dark font-bold text-xs hover:bg-gold/10 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Auto Plan</span>
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm">
          <span className="text-[11px] font-semibold text-darkText/70 uppercase">Total Auto Tasks</span>
          <div className="text-2xl font-serif font-bold text-navy-900 mt-1">{tasks.length} Milestones</div>
          <span className="text-[10px] text-royal font-medium">Bespoke Lead-time Schedule</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm">
          <span className="text-[11px] font-semibold text-darkText/70 uppercase">Completed</span>
          <div className="text-2xl font-serif font-bold text-green-700 mt-1">{doneCount} Done</div>
          <span className="text-[10px] text-green-600 font-medium">{tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}% Progress</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm">
          <span className="text-[11px] font-semibold text-darkText/70 uppercase">In Progress</span>
          <div className="text-2xl font-serif font-bold text-royal mt-1">{inProgressCount} Active</div>
          <span className="text-[10px] text-darkText/60">Assigned to team</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm">
          <span className="text-[11px] font-semibold text-darkText/70 uppercase">To Plan / Queue</span>
          <div className="text-2xl font-serif font-bold text-amber-700 mt-1">{toPlanCount} Scheduled</div>
          <span className="text-[10px] text-darkText/60">{blockedCount} Blocked</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gold/30 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-navy-900 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold border ${
              filterCategory === 'ALL'
                ? 'bg-navy-900 text-gold border-gold'
                : 'bg-white border-navy-200 text-darkText hover:border-gold'
            }`}
          >
            All Categories ({tasks.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold border ${
                filterCategory === cat
                  ? 'bg-navy-900 text-gold border-gold'
                  : 'bg-white border-navy-200 text-darkText hover:border-gold'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-darkText/70">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-1.5 rounded-lg border border-navy-200 bg-white font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value={TaskStatus.TO_PLAN}>To Plan</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.BLOCKED}>Blocked</option>
            <option value={TaskStatus.DONE}>Done</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              t.status === TaskStatus.DONE
                ? 'bg-green-50/60 border-green-200'
                : t.status === TaskStatus.IN_PROGRESS
                ? 'bg-white border-royal/40 shadow-sm'
                : 'bg-white border-navy-200/80 shadow-sm'
            }`}
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-100 text-navy-900">
                  {t.category}
                </span>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    t.priority === TaskPriority.URGENT
                      ? 'bg-red-100 text-red-800'
                      : t.priority === TaskPriority.HIGH
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-navy-50 text-darkText/70'
                  }`}
                >
                  {t.priority}
                </span>

                {t.leadTimeDays !== undefined && (
                  <span className="text-[11px] font-semibold text-royal flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{t.leadTimeDays > 0 ? `T-${t.leadTimeDays} days` : t.leadTimeDays === 0 ? 'Day-of Event' : 'Post-Wedding'}</span>
                  </span>
                )}
              </div>

              <h4 className={`font-serif text-base font-bold ${t.status === TaskStatus.DONE ? 'line-through text-darkText/60' : 'text-navy-900'}`}>
                {t.title}
              </h4>

              <p className="text-xs text-darkText/75 leading-relaxed">
                {t.description}
              </p>
            </div>

            {/* Status Dropdown Controller */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-[11px] text-darkText/60 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                <span>Due: {new Date(t.deadline).toLocaleDateString()}</span>
              </span>

              <select
                value={t.status}
                onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                  t.status === TaskStatus.DONE
                    ? 'bg-green-100 text-green-900 border-green-300'
                    : t.status === TaskStatus.IN_PROGRESS
                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                    : t.status === TaskStatus.BLOCKED
                    ? 'bg-red-100 text-red-900 border-red-300'
                    : 'bg-navy-50 text-navy-900 border-navy-200'
                }`}
              >
                <option value={TaskStatus.TO_PLAN}>To Plan</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.BLOCKED}>Blocked</option>
                <option value={TaskStatus.DONE}>Done ✓</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
