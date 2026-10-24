'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { CONFIG } from '@/config';

export type TelemetryStatus = 'pass' | 'warn' | 'fail' | 'offline' | 'loading';

export interface TelemetryContextType {
  status: TelemetryStatus;
  alertsCount: number;
  activeTasks: number;
  cpuUsage: number;
  ramUsage: number;
  lastUpdated: string;
  refresh: () => void;
}

const defaultTelemetry: TelemetryContextType = {
  status: 'pass',
  alertsCount: 2,
  activeTasks: 18,
  cpuUsage: 28.4,
  ramUsage: 10.2,
  lastUpdated: '2026-10-24T00:00:00.000Z',
  refresh: () => { },
};

const AdminTelemetryContext = createContext<TelemetryContextType>(defaultTelemetry);

export function AdminTelemetryProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<TelemetryStatus>('pass');
  const [alertsCount, setAlertsCount] = useState(2);
  const [activeTasks, setActiveTasks] = useState(18);
  const [cpuUsage, setCpuUsage] = useState(28.4);
  const [ramUsage, setRamUsage] = useState(10.2);
  const [lastUpdated, setLastUpdated] = useState('2026-10-24T00:00:00.000Z');

  const consecutiveFailuresRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTelemetry = useCallback(async () => {
    try {
      // In this version, we simulate robust polling. In future it connects to real telemetry endpoints.
      const isSuccess = Math.random() > 0.05; // 95% simulated uptime success

      if (isSuccess) {
        consecutiveFailuresRef.current = 0;
        setStatus('pass');
        setCpuUsage(Number((24 + Math.random() * 8).toFixed(1)));
        setRamUsage(Number((10 + Math.random() * 0.8).toFixed(1)));
        setActiveTasks(18);
        setAlertsCount(2);
        setLastUpdated(new Date().toISOString());
      } else {
        consecutiveFailuresRef.current += 1;
        if (consecutiveFailuresRef.current >= 3) {
          setStatus('offline');
        } else {
          setStatus('warn');
        }
      }
    } catch {
      consecutiveFailuresRef.current += 1;
      if (consecutiveFailuresRef.current >= 3) {
        setStatus('offline');
      }
    }
  }, []);

  const refresh = useCallback(() => {
    setStatus('loading');
    fetchTelemetry();
  }, [fetchTelemetry]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          void fetchTelemetry();
        }, CONFIG.dashboard.refreshIntervalMs);
      }
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchTelemetry();
        startPolling();
      } else {
        stopPolling();
      }
    };

    // Schedule initial telemetry sync asynchronously to avoid synchronous setState in effect
    timeoutId = setTimeout(() => {
      void fetchTelemetry();
    }, 0);

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchTelemetry]);

  return (
    <AdminTelemetryContext.Provider
      value={{
        status,
        alertsCount,
        activeTasks,
        cpuUsage,
        ramUsage,
        lastUpdated,
        refresh,
      }}
    >
      {children}
    </AdminTelemetryContext.Provider>
  );
}

export function useAdminTelemetry(): TelemetryContextType {
  return useContext(AdminTelemetryContext);
}
