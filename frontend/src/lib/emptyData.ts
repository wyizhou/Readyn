// Structurally-complete but empty ApexData — the frontend's initial/offline
// state now that the mock data is gone. Every field the UI reads exists with an
// empty/zero value so components render honest empty states until the backend
// bootstrap (and a Garmin sync) fills them in. Mirrors backend
// app/garmin/transform.py:empty_apexdata().
import type { ApexData, Connector, Profile, Today } from './types'

// The connector catalog — what you *can* connect — exists client-side too so the
// connect entry point shows before any backend bootstrap. The backend serves the
// authoritative copy (with live status) once reachable. Mirrors backend seed.py.
export const connectorRegistry: Connector[] = [
  {
    id: 'garmin-cn',
    name: '佳明 · 中国区',
    cat: '可穿戴设备',
    status: 'available',
    icon: 'watch',
    color: '#007cc3',
    sync: '—',
    metrics: ['跑步', '登山', 'HRV', '睡眠', '心率', '体重'],
    records: '—',
  },
]

export const emptyProfile: Profile = {
  name: '',
  handle: '',
  role: '',
  disciplines: [],
  location: '',
  since: '',
  sex: '',
  birth: '',
  height: 0,
  restingHR: 0,
  maxHR: 0,
  goal: '',
  targetWeight: 0,
  aiProvider: '',
  aiBase: '',
  aiKey: '',
  aiModel: '',
}

const emptyToday: Today = {
  readiness: 0,
  hrv: 0,
  hrvDelta: 0,
  rhr: 0,
  rhrDelta: 0,
  sleep: 0,
  sleepScore: 0,
  acwr: 0,
  ctl: 0,
  atl: 0,
  tsb: 0,
  weekLoad: 0,
  weekLoadDelta: 0,
  recoveryState: 'balanced',
  strain: 0,
}

export const emptyData: ApexData = {
  profile: { ...emptyProfile },
  weightLog: [],
  today: { ...emptyToday },
  pmc: [],
  templateDetails: {},
  metrics: {} as ApexData['metrics'],
  activityDetails: {},
  hrv: [],
  sleep: [],
  hrZones: [],
  disciplineSplit: [],
  balance: [],
  boulderPyramid: [],
  activities: [],
  insights: [],
  plan: { week: '', focus: '', compliance: 0, days: [] },
  workout: { title: '', sport: '', when: '', target: '', load: 0, duration: '', rationale: '', steps: [] },
  connectors: connectorRegistry.map((c) => ({ ...c })),
  schema: [],
  library: { running: [], climbing: [], plans: [] },
  calendar: [],
  calendarEvents: {},
  unlinked: [],
  linkTargets: [],
}
