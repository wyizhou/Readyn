// Static multi-sport + transparency taxonomy — mirrors the design's
// window.APEX_DATA.{sports,loadSources,sourceMeta,empty} (see app/data.js).
// These are app constants (not synced user data), so they exist in every state
// — including the not-yet-connected empty state — and drive the support layer:
// the global sport filter, source badges / "how calculated" popovers, and the
// per-module empty states.
import type { EmptyCopy, LoadSource, Sport, SourceKey, SourceMeta } from './types'

// Sport taxonomy — drives the global sport filter. 'all' is the default;
// climbing stays a first-class sport but no longer the headline.
export const sports: Sport[] = [
  { id: 'all', name: '全部运动', icon: 'layers', color: 'var(--blue-400)' },
  { id: 'run', name: '跑步', icon: 'footprints', color: 'var(--blue-500)', loadMethod: 'HR-TRIMP + 配速', specific: ['vo2max_run', 'pacezones'] },
  { id: 'ride', name: '骑行', icon: 'bike', color: 'var(--cyan-500)', loadMethod: '功率 TSS', specific: ['ftp'] },
  { id: 'swim', name: '游泳', icon: 'waves', color: 'var(--violet-400)', loadMethod: 'HR-TRIMP + CSS', specific: ['css'] },
  { id: 'strength', name: '力量', icon: 'dumbbell', color: 'var(--amber-500)', loadMethod: '容量 + 主观 RPE', specific: [] },
  { id: 'climb', name: '攀岩', icon: 'grip', color: 'var(--green-500)', loadMethod: '主观 RPE + 时长', specific: ['climbpyramid'] },
  { id: 'hike', name: '徒步/登山', icon: 'mountain', color: 'var(--violet-500)', loadMethod: 'HR-TRIMP + 爬升', specific: [] },
]

export const sportByKey: Record<string, Sport> = Object.fromEntries(sports.map((s) => [s.id, s]))

// Load-source taxonomy (how an activity's AU was computed). Normalised to AU
// server-side; the activity detail must show which method produced the number.
export const loadSources: Record<string, LoadSource> = {
  'HR-TRIMP': { label: 'HR-TRIMP', icon: 'heart-pulse', desc: '由心率时序与时长按 Banister TRIMP 计算', color: 'var(--red-400)' },
  '功率 TSS': { label: '功率 TSS', icon: 'zap', desc: '由功率计的标准化功率 NP 与 FTP 计算 (Coggan)', color: 'var(--amber-400)' },
  '主观 RPE': { label: '主观 RPE', icon: 'gauge', desc: '心率无法反映攀岩/力量负荷，改用 RPE×时长 (sRPE)', color: 'var(--green-400)' },
  '容量 + RPE': { label: '容量 + RPE', icon: 'dumbbell', desc: '力量训练以总容量(组×次×重量)结合 RPE 估算', color: 'var(--amber-400)' },
}

// Provenance metadata for the transparency badge: Garmin 直供 / Readyn 自算 / 混合.
export const sourceMeta: Record<SourceKey, SourceMeta> = {
  garmin: { label: 'Garmin 直供', color: 'var(--cyan-400)', bg: 'rgba(0,124,195,0.16)', icon: 'watch', desc: '由佳明设备/Connect 直接提供，Readyn 不二次加工。' },
  readyn: { label: 'Readyn 自算', color: 'var(--violet-300)', bg: 'rgba(124,77,255,0.16)', icon: 'cpu', desc: '由 Readyn 依据公开运动科学模型在云端计算。' },
  mixed: { label: '混合来源', color: 'var(--blue-300)', bg: 'rgba(59,91,255,0.16)', icon: 'git-merge', desc: '佳明提供原始数据，Readyn 计算派生基线。' },
}

// Per-module empty-state copy (shown until a data source is connected).
export const emptyCopy: Record<string, EmptyCopy> = {
  dashboard: { icon: 'plug-zap', title: '尚未连接数据源', desc: '连接佳明（中国区）后，这里会显示你的就绪度、体能趋势与全运动负荷分析。' },
  activities: { icon: 'list', title: '暂无活动', desc: '连接佳明后将自动同步你的跑步、骑行、游泳、攀岩等全部活动。' },
  records: { icon: 'list', title: '暂无运动记录', desc: '连接佳明后将自动同步并按时间列出你的全部运动记录。' },
  training: { icon: 'calendar-off', title: '暂无训练计划', desc: '连接数据源或用 AI 生成一份计划，开始安排你的训练周。' },
  library: { icon: 'library', title: '训练库为空', desc: '同步历史训练或新建模板后，这里会按项目归类你的训练模板。' },
  weight: { icon: 'scale', title: '暂无体重记录', desc: '手动录入或从佳明同步体重，开始追踪趋势与 BMI。' },
  metric: { icon: 'line-chart', title: '暂无数据', desc: '连接佳明并完成首次同步后，该指标会在这里展开趋势与解读。' },
}
