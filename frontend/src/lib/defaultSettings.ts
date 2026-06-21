import type { SettingsDoc } from './types'

// Frontend defaults — mirror backend DEFAULT_SETTINGS; used offline / before the
// backend responds.
export const defaultSettings: SettingsDoc = {
  units: {
    distance: '公里 (km)',
    weight: '公斤 (kg)',
    temp: '摄氏 (℃)',
    pace: 'min/km',
    elevation: '米 (m)',
  },
  hr: { method: '% 最大心率' },
  notifications: {
    todayWorkout: true,
    loadAlert: true,
    aiInsight: true,
    weeklySummary: false,
    planChange: true,
    sendMilestone: true,
  },
  privacy: {
    visibility: '私密',
    aiHealth: true,
    anonResearch: false,
    grants: { Strava: true, 第三方分析平台: false },
  },
  theme: { mode: 'dark', density: '标准', fontScale: '标准' },
}
