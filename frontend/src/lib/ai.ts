// Client-side AI chat — calls an OpenAI-compatible endpoint DIRECTLY from the
// browser using the user's locally-stored key (profile.aiBase/aiKey/aiModel).
// The key is never sent to the Trainalyze backend, honouring the "密钥仅本地" promise.
// (Browser→provider calls may be subject to the provider's CORS policy; on any
// failure the caller falls back to the built-in expert replies.)
import type { ApexData, Profile } from './types'

export interface AiConfig {
  base: string
  key: string
  model: string
}

export function aiConfigFrom(p: Profile): AiConfig | null {
  if (p.aiBase && p.aiKey && p.aiModel) return { base: p.aiBase, key: p.aiKey, model: p.aiModel }
  return null
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// The fixed sport-science expert system prompt, with the last-14-days context.
export function expertSystemPrompt(data: ApexData, body: { weight: number; bmi: number }): string {
  const t = data.today
  return [
    '你是 Trainalyze 的运动科学专家，用简洁、专业、可执行的中文回答用户关于训练、恢复与指标的问题。',
    '已载入用户近 14 天数据，回答时结合以下上下文：',
    `就绪度 ${t.readiness} · HRV ${t.hrv}ms · 静息心率 ${t.rhr}bpm · 睡眠 ${t.sleep}h · 周负荷 ${t.weekLoad} AU · ACWR ${t.acwr} · 体重 ${body.weight}kg · BMI ${body.bmi}`,
    '给训练/恢复建议时注意 ACWR 安全区间 0.8–1.3；不做医疗诊断。',
  ].join('\n')
}

export async function aiChat(cfg: AiConfig, messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${cfg.base.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({ model: cfg.model, messages, temperature: 0.5, stream: false }),
  })
  if (!res.ok) throw new Error(`AI ${res.status}`)
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  return data.choices?.[0]?.message?.content?.trim() ?? ''
}
