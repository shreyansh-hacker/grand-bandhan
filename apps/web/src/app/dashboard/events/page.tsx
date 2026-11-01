'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  Radio,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
  Calendar,

  ShieldAlert,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { EventStatus, ArrivalStatus } from '@grand-bandhan/shared';

export default function EventsTimelinePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [wedding, setWedding] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    try {
      const wRes = await apiRequest('/api/weddings');
      if (wRes.success && wRes.data && wRes.data.length > 0) {
        const w = wRes.data[0];
        setWedding(w);
        const eRes = await apiRequest(`/api/events?weddingId=${w.id}`);
        if (eRes.success && eRes.data) {
          setEvents(eRes.data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleStatusChange(eventId: string, newStatus: EventStatus) {
    try {
      const res = await apiRequest(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royal">
            <Radio className="w-4 h-4 text-green-500 animate-pulse" />
            <span>Wedding-Day Operations Run-Sheet</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mt-0.5">
            Live Timeline & Vendor Arrival Gate Radar
          </h2>
          <p className="text-xs text-darkText/70">
            Real-time synchronization of Groom/Bride arrivals, garland exchange, ritual cues, and loading dock delays.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl text-green-800 text-xs font-bold self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
          <span>Socket.IO Sync Active</span>
        </div>
      </div>

      {/* Events Timeline Sequence */}
      <div className="space-y-4">
        {events.map((ev, index) => {
          const startTime = new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const endTime = new Date(ev.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const arrivals = ev.arrivals || [];

          return (
            <div
              key={ev.id}
              className="bg-white border-2 border-gold/30 rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden"
            >
              {/* Timeline Time Marker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-navy-900 text-gold flex items-center justify-center font-bold text-xs shadow-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy-900">{ev.title}</h3>
                    <div className="text-xs text-royal font-semibold flex items-center gap-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{startTime} – {endTime}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{ev.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={ev.status}
                    onChange={(e) => handleStatusChange(ev.id, e.target.value as EventStatus)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                      ev.status === EventStatus.COMPLETED
                        ? 'bg-green-100 text-green-900 border-green-300'
                        : ev.status === EventStatus.IN_PROGRESS
                        ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                        : 'bg-navy-50 text-navy-900 border-navy-200'
                    }`}
                  >
                    <option value={EventStatus.SCHEDULED}>Scheduled</option>
                    <option value={EventStatus.IN_PROGRESS}>In Progress (Live)</option>
                    <option value={EventStatus.COMPLETED}>Completed ✓</option>
                    <option value={EventStatus.DELAYED}>Delayed ⚠️</option>
                  </select>
                </div>
              </div>

              {/* Event Notes & Staff */}
              <div className="text-xs text-darkText/80 leading-relaxed bg-cream-100 p-3 rounded-xl border border-navy-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>{ev.notes || 'Master timeline execution cues aligned with audio-visual and ceremonial priests.'}</span>
                <span className="text-[11px] font-semibold text-navy-900 flex-shrink-0 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gold-dark" />
                  <span>Lead: {ev.responsibleStaff?.name || 'Assigned Coordinator'}</span>
                </span>
              </div>

              {/* Vendor Arrival Radar Sub-section */}
              {arrivals.length > 0 && (
                <div className="pt-2 border-t border-navy-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-royal flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-gold-dark" />
                    <span>Vendor Gate Arrival Tracker ({arrivals.length} Vendor Logged)</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {arrivals.map((arr: any) => (
                      <div
                        key={arr.id}
                        className="bg-navy-50 p-3 rounded-xl border border-navy-200/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-navy-900">{arr.vendor?.name || 'Vendor'}</div>
                          <div className="text-[11px] text-darkText/60">
                            Expected: {new Date(arr.expectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              arr.arrivalStatus === ArrivalStatus.ARRIVED_ON_TIME
                                ? 'bg-green-100 text-green-800'
                                : arr.arrivalStatus === ArrivalStatus.DELAYED
                                ? 'bg-red-100 text-red-800'
                                : 'bg-navy-100 text-navy-800'
                            }`}
                          >
                            {arr.arrivalStatus.replace(/_/g, ' ')}
                          </span>
                          {arr.actualArrivalTime && (
                            <div className="text-[10px] text-green-700 font-semibold mt-0.5">
                              Checked In: {new Date(arr.actualArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
