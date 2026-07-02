# Exec Plan: 总览趋势来源与公式摘要对齐

## Status

- State: completed
- Created: 2026-07-02
- Updated: 2026-07-02
- Owner: Codex
- Related design version: Open Design v0.1.0
- Related files:
  - frontend/src/modules/Dashboard.tsx
  - frontend/src/modules/Dashboard.test.tsx
  - frontend/src/App.test.tsx
  - frontend/src/lib/emptyData.ts
  - frontend/src/lib/types.ts

## Goal

将总览页负荷趋势区域继续向 Open Design v0.1.0 对齐，补出可验证的“来源证据”和“公式摘要”最小结构，同时保留现有趋势图。

## Scope

- 核对 Open Design `index.html` 的负荷趋势区域：每日、来源、公式三个子面。
- 只处理 Dashboard 中一个具体可验证差异：趋势区域下的来源证据与公式摘要呈现。
- 在现有 `体能趋势` / `来源证据与公式说明` 区域内，补充最小来源证据结构和公式摘要结构。
- 来源证据只使用当前真实边界能表达的信息：
  - Garmin 中国可作为当前主要连接器来源。
  - Trainalyze 自算负荷指标。
  - 对未接入或未确认的数据源显示待命/未连接，不声称已有数据。
- 公式摘要只覆盖当前已有负荷模型字段：
  - ATL = 7d EWMA
  - CTL = 42d EWMA
  - TSB = CTL - ATL
  - A:C / ACWR 使用现有 `acwr` 字段说明
  - Easy TRIMP 缺少真实字段时只显示缺失/待算法字段说明。
- 更新相关测试，覆盖来源证据、公式摘要和无数据不伪造。

## Non-scope

- 不完整重写 Dashboard。
- 不完整实现 Open Design 视觉。
- 不实现完整 tabs 交互，除非可以用非常小的静态结构完成且不扩大范围。
- 不接入新的后端 API。
- 不改训练负荷算法。
- 不新增或伪造 Garmin International 同步结果。
- 不新增或伪造 Easy TRIMP 数值。
- 不制造 mock 数据。
- 不处理下一次训练建议结构。
- 不处理活动、健康、连接、教练、登录/注册页面。
- 不实现真实认证、地图或 LLM。

## Inputs

- AGENTS.md
- docs/harness/README.md
- docs/harness/project-status.md
- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md
- docs/harness/validation-and-delivery.md
- Open Design `设计交接文档.md` 的 `index.html` 负荷总览章节
- Open Design `index.html`
- frontend/src/modules/Dashboard.tsx
- frontend/src/modules/Dashboard.test.tsx
- frontend/src/App.test.tsx
- frontend/src/lib/emptyData.ts
- frontend/src/lib/types.ts

## Current Facts

- P0 主流程骨架与空态审计已完成。
- Dashboard 当前仍是 `partial`。
- 总览页已完成结构标识切片和负荷指标卡字段切片。
- Open Design `index.html` 的趋势区域包含 `每日`、`来源`、`公式` 三个子面。
- Open Design 来源示例包含 Garmin 中国、Garmin International、手动记录；当前代码明确可连接源主要是 Garmin 中国，不能声称 Garmin International 已同步。
- 当前 `Dashboard.tsx` 已有 PMC 趋势图、`SourceBadge` 和 `HowInfo`，但没有显式来源证据列表或公式摘要列表。
- `decisions.md` 要求无数据不能伪造，训练负荷由 Trainalyze 自算。

## Open Questions

暂无阻塞。若实现时发现必须新增后端字段、完整 tabs 状态机、复制公式行为或新的数据源状态，停止并向用户确认。

## Steps

- [x] 重新核对 Open Design 趋势区域的来源/公式结构与当前 Dashboard 实现差异。
- [x] 设计最小 React 调整，优先复用现有 `Card`、`SourceBadge`、`HowInfo`、`EmptyState` 和当前数据字段。
- [x] 补充来源证据最小结构，明确 Garmin 中国 / Trainalyze 自算 / 未接入来源边界。
- [x] 补充公式摘要最小结构，覆盖 ATL、CTL、TSB、A:C，并对 Easy TRIMP 诚实显示缺失字段。
- [x] 更新 `Dashboard.test.tsx` 或 `App.test.tsx`，锁定来源证据、公式摘要和无伪造数据行为。
- [x] 运行本计划要求的前端验证。
- [x] 更新 Harness 状态并移动本计划到 completed。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [x] 体能趋势区域仍显示 PMC 趋势图。
- [x] 总览页显示明确的来源证据结构。
- [x] 来源证据不声称 Garmin International 已同步或已合并，除非当前代码有真实数据支持。
- [x] 总览页显示明确的公式摘要结构。
- [x] 公式摘要覆盖 ATL、CTL、TSB、A:C。
- [x] Easy TRIMP 没有真实字段时仍显示 `—` / 待算法字段或等价空态，不显示伪造数值。
- [x] 不改后端 API 和训练负荷算法。
- [x] 相关测试覆盖本切片行为。

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [x] Frontend lint: `npm run lint` passed.
- [x] Frontend tests: `npm run test:run` passed.
- [x] Frontend typecheck: `npm run typecheck` passed.
- [x] Frontend build: `npm run build` passed.
- [x] Backend ruff: N/A，本切片未改后端。
- [x] Backend pytest: N/A，本切片未改后端。

不需要的项目写 `N/A` 和原因。不要在本计划里复制所有全局验证规则，只记录本任务需要运行的验证。

## Delivery

参考 docs/harness/validation-and-delivery.md。

- 是否需要更新 project-status.md: yes，已更新。
- 是否需要更新 backlog.md: yes，已更新。
- 是否需要更新 decisions.md: no，本切片未产生新决策。
- 是否需要 commit/push: yes，完成后提交并 push。
- Backlog source item: P1 - 将当前 Dashboard 调整为 Open Design 的负荷总览结构。
- Backlog update required: yes
- Completion effect: partial
- Suggested next slice needs review: yes

## Resume Point

- 已完成什么：体能趋势卡已补充来源证据和公式摘要最小结构；Garmin International 标记为未接入；Easy TRIMP 仍显示空值，不伪造数值；前端验证通过；Harness 已更新。
- 下一步是什么：停止并汇报本切片结果，不自动进入下一个切片。
- 当前阻塞是什么：暂无阻塞。
