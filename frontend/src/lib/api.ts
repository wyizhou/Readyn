// Thin API client for the Readyn backend. In dev, Vite proxies `/api` to the
// FastAPI server (see vite.config.ts). All calls are best-effort: callers fall
// back to local/mock data when the backend is unavailable.
import type { ApexData, Connector, ConnectorConfig, Profile, SettingsDoc, WeightEntry } from './types'

const BASE = '/api'

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

async function sendJSON<T>(method: 'POST' | 'PUT', path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

export interface LoginResult {
  token: string
  accountId: string
}

export interface TestConnectionRequest {
  provider?: string
  base?: string
  model?: string
  key?: string
}

export interface GarminStatus {
  connectorId: string
  connected: boolean
  account: string | null
  lastSync: string | null
  lastError: string | null
  configured: boolean
}

export interface GarminConnectResult {
  needsMfa: boolean
  mfaToken?: string
  connected?: boolean
  activities?: number
  hrv?: number
  sleep?: number
  weight?: number
  lastSync?: string
}

export interface GarminSyncResult {
  activities: number
  hrv: number
  sleep: number
  weight: number
  lastSync: string
}

export interface TestConnectionResult {
  ok: boolean
  message: string
  model?: string
  latencyMs?: number
}

export const api = {
  bootstrap: () => getJSON<ApexData>('/bootstrap'),
  health: () => getJSON<{ status: string }>('/health'),
  login: (accountId: string, password?: string) =>
    sendJSON<LoginResult>('POST', '/auth/login', { accountId, password }),
  updateProfile: (profile: Profile) => sendJSON<Profile>('PUT', '/profile', profile),
  addWeight: (entry: WeightEntry) => sendJSON<WeightEntry[]>('POST', '/weight', entry),
  updateConnectorConfig: (id: string, config: ConnectorConfig) =>
    sendJSON<Connector>('PUT', `/connectors/${id}/config`, config),
  getSettings: () => getJSON<SettingsDoc>('/settings'),
  // The backend deep-merges, so a partial patch is a valid (and the common) payload.
  saveSettings: (settings: Partial<SettingsDoc>) => sendJSON<SettingsDoc>('PUT', '/settings', settings),
  testConnection: (req: TestConnectionRequest) =>
    sendJSON<TestConnectionResult>('POST', '/ai/test-connection', req),
  // Garmin China (connect.garmin.cn) — real account login + sync.
  garminStatus: () => getJSON<GarminStatus>('/garmin/status'),
  garminConnect: (email?: string, password?: string) =>
    sendJSON<GarminConnectResult>('POST', '/garmin/connect', { email, password }),
  garminMfa: (mfaToken: string, code: string) =>
    sendJSON<GarminConnectResult>('POST', '/garmin/mfa', { mfaToken, code }),
  garminSync: () => sendJSON<GarminSyncResult>('POST', '/garmin/sync', {}),
}
