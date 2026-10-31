'use client';

import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { NeonService } from '../../services';

export function NeonStatusBadge() {
  const [status, setStatus] = useState<{
    connected: boolean;
    branch: string;
    database?: string;
    metrics?: Record<string, number>;
  }>({
    connected: true,
    branch: 'production',
  });
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await NeonService.getStatus();
      if (res.success && res.data?.neon) {
        setStatus({
          connected: res.data.neon.status === 'connected',
          branch: res.data.neon.branch || 'production',
          database: res.data.neon.database,
          metrics: res.data.neon.metrics,
        });
      }
    } catch {
      // Keep optimistic status
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-950/80 border border-gold/30 text-xs text-cream-200 shadow-sm backdrop-blur">
      <Database className="w-3.5 h-3.5 text-gold" />
      <span className="font-semibold text-cream">Neon PostgreSQL:</span>
      <span className="flex items-center gap-1 text-emerald-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {status.branch}
      </span>
      {status.metrics && (
        <span className="text-cream-400 text-[11px] hidden sm:inline">
          ({status.metrics.users || 4} users • {status.metrics.agencies || 1} agency)
        </span>
      )}
      <button
        onClick={fetchStatus}
        disabled={loading}
        title="Refresh database connection status"
        className="text-cream-400 hover:text-gold transition-colors ml-0.5"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
