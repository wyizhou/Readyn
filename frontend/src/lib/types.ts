// ============================================================
// Readyn domain model — typed mirror of the README §7 data shapes
// (window.APEX_DATA). Field names double as the backend API contract.
// ============================================================

export type Tone = 'positive' | 'caution' | 'accent' | 'critical' | 'neutral'
export type DeltaTone = 'pos' | 'neg' | 'flat'
export type Impact = 'pos' | 'neg'

export interface Profile {
  name: string
  handle: string
  role: string
  disciplines: string[]
  location: string
  since: string
  sex: string
  birth: string
  height: number
  restingHR: number
  maxHR: number
  goal: string
  targetWeight: number
  aiProvider: string
  aiBase: string
  aiKey: string
  aiModel: string
}

export interface WeightEntry {
  date: string
  kg: number
  fat?: number
  note?: string
}

export type RecoveryState = 'balanced' | 'strained' | 'fresh'

export interface Today {
  readiness: number
  hrv: number
  hrvDelta: number
  rhr: number
  rhrDelta: number
  sleep: number
  sleepScore: number
  acwr: number
  ctl: number
  atl: number
  tsb: number
  weekLoad: number
  weekLoadDelta: number
  recoveryState: RecoveryState
  strain: number
}

export interface PmcPoint {
  i: number
  ctl: number
  atl: number
  tsb: number
  load: number
}

export interface MetricBand {
  label: string
  range: string
  color: string
  active?: boolean
}

export interface MetricFactor {
  label: string
  impact: Impact
  v: string
}

export interface MetricAI {
  text: string
  tags: string[]
}

export interface MetricDeepDive {
  name: string
  short: string
  value: number
  unit: string
  delta: string
  deltaTone: DeltaTone
  status: string
  statusTone: Tone
  color: string
  definition: string
  formula: string
  bands: MetricBand[]
  factors: MetricFactor[]
  ai: MetricAI
  related: string[]
}

export type MetricId = 'hrv' | 'acwr' | 'ctl' | 'tsb' | 'rhr' | 'sleep'

// ---- template structure blocks (heterogeneous) ----
export interface TemplatePhase {
  dur?: string
  zone?: string
  detail?: string
}
export interface TemplateStructureBlock {
  block: string
  dur?: string
  zone?: string
  detail?: string
  reps?: number
  sets?: string | number
  work?: TemplatePhase
  rest?: TemplatePhase
  target?: string
}
export interface TemplateDetail {
  structure: TemplateStructureBlock[]
  progression: string[]
  cues: string
}

// ---- activity deep-dive ----
export interface Weather {
  temp: number
  hum: number
  wind: string
}
export interface ActivityTarget {
  pace?: string
  load: number
  zone?: string
  grade?: string
  from: string
}
export interface ActivityActual {
  pace?: string
  load: number
  zone?: string
  maxGrade?: string
  sends?: number
}
export type SendStatus = 'send' | 'project' | 'flash'
export interface ClimbSend {
  grade: string
  line: string
  attempts: number
  status: SendStatus
  style: string
}
export interface ActivityVerdict {
  verdict: string
  tone: Tone
  text: string
  tags: string[]
}
export interface ActivityDetail {
  device: string
  sport: string
  weather?: Weather
  gym?: string
  elapsed?: string
  moving?: string
  calories?: number
  cadence?: number
  stride?: number
  trainingEffect?: string
  hrDrift?: number
  vo2?: number
  avgHR?: number
  peakHR?: number
  target: ActivityTarget
  actual: ActivityActual
  sends?: ClimbSend[]
  ai: ActivityVerdict
}

export interface HrvPoint {
  i: number
  v: number
  base: number
}

export interface SleepNight {
  d: string
  deep: number
  rem: number
  light: number
  awake: number
  score: number
}

export interface HrZone {
  z: string
  label: string
  pct: number
  color: string
}

export interface DisciplineSplit {
  name: string
  icon: string
  load: number
  pct: number
  color: string
  trend: number[]
}

export interface BalanceAxis {
  axis: string
  v: number
}

export interface PyramidRow {
  grade: string
  sends: number
  color: string
}

export type ActivityFlag = 'high' | 'ok'

export interface Activity {
  id: string
  name: string
  sport: string
  icon: string
  date: string
  dist: string
  dur: string
  load: number
  hr: number
  flag: ActivityFlag
  note: string
}

export interface Insight {
  id: string
  tone: Tone
  icon: string
  title: string
  body: string
  tag: string
}

export type PlanDayStatus = 'done' | 'today' | 'planned' | 'rest'
export interface PlanItem {
  t: string
  sport: string
  load: number
  done: boolean
  dur: string
}
export interface PlanDay {
  d: string
  date: string
  items: PlanItem[]
  status: PlanDayStatus
  adapted?: boolean
}
export interface Plan {
  week: string
  focus: string
  compliance: number
  days: PlanDay[]
}

export interface WorkoutStep {
  t: string
  d: string
  z: string
  note?: string
}
export interface Workout {
  title: string
  sport: string
  when: string
  target: string
  load: number
  duration: string
  rationale: string
  steps: WorkoutStep[]
}

export type ConnectorStatus = 'connected' | 'syncing' | 'available'
export interface ConnectorConfig {
  auto?: boolean
  frequency?: string
  conflict?: string
  backfill?: boolean
  mapping?: Record<string, boolean>
}

export interface Connector {
  id: string
  name: string
  cat: string
  status: ConnectorStatus
  icon: string
  color: string
  sync: string
  metrics: string[]
  records: string
  config?: ConnectorConfig
}

export interface SchemaRow {
  canonical: string
  type: string
  sources: string[]
  coverage: number
}

export interface Template {
  id: string
  name: string
  type: string
  target: string
  load: number
  dur: string
  uses: number
  desc: string
}

export type PlanSource = 'AI' | '手动'
export interface LibraryPlan {
  id: string
  name: string
  goal: string
  weeks: number
  load: number
  sessions: number
  sports: string[]
  updated: string
  source: PlanSource
}

export interface Library {
  running: Template[]
  climbing: Template[]
  plans: LibraryPlan[]
}

export interface CalendarEntry {
  t: string
  s: string
  load: number
}
export interface CalendarActual {
  s: string
  load: number
  linked: boolean
}
export interface CalendarEvent {
  p?: CalendarEntry
  a?: CalendarActual
  today?: boolean
  adapted?: boolean
}
export type CalendarEvents = Record<number, CalendarEvent>

export interface UnlinkedActivity {
  id: string
  name: string
  sport: string
  icon: string
  date: string
  dist: string
  dur: string
  load: number
  source: string
}

export interface LinkTarget {
  id: string
  label: string
  sport: string
}

// ---- user settings (README §8) ----
export interface UnitsSettings {
  distance: string
  weight: string
  temp: string
  pace: string
  elevation: string
}
export interface HrSettings {
  method: string
  maxHR?: number
}
export interface NotificationSettings {
  todayWorkout: boolean
  loadAlert: boolean
  aiInsight: boolean
  weeklySummary: boolean
  planChange: boolean
  sendMilestone: boolean
}
export interface PrivacySettings {
  visibility: string
  aiHealth: boolean
  anonResearch: boolean
  grants: Record<string, boolean>
}
export interface ThemeSettings {
  mode: string
  density: string
  fontScale: string
}
export interface SettingsDoc {
  units: UnitsSettings
  hr: HrSettings
  notifications: NotificationSettings
  privacy: PrivacySettings
  theme: ThemeSettings
}

export interface ApexData {
  profile: Profile
  weightLog: WeightEntry[]
  today: Today
  pmc: PmcPoint[]
  templateDetails: Record<string, TemplateDetail>
  metrics: Record<MetricId, MetricDeepDive>
  activityDetails: Record<string, ActivityDetail>
  hrv: HrvPoint[]
  sleep: SleepNight[]
  hrZones: HrZone[]
  disciplineSplit: DisciplineSplit[]
  balance: BalanceAxis[]
  boulderPyramid: PyramidRow[]
  activities: Activity[]
  insights: Insight[]
  plan: Plan
  workout: Workout
  connectors: Connector[]
  schema: SchemaRow[]
  library: Library
  calendar: (number | null)[]
  calendarEvents: CalendarEvents
  unlinked: UnlinkedActivity[]
  linkTargets: LinkTarget[]
}
