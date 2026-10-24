export interface PublicStatusData {
  status: 'operational' | 'degraded' | 'outage';
  uptime: number; // Mocked 99.98% at this stage
  version: string;
  updatedAt: string;
}

export function getPublicStatus(): PublicStatusData {
  return {
    status: 'operational',
    uptime: 99.98,
    version: '0.1.0',
    updatedAt: '2026-10-24T00:00:00.000Z',
  };
}
