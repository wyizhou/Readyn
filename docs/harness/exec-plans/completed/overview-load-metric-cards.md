# Exec Plan: 总览负荷指标卡字段对齐

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
  - frontend/src/lib/types.ts
  - frontend/src/lib/emptyData.ts

## Goal

将总览页负荷指标卡字段继续对齐 Open Design v0.1.0：优先让指标卡聚焦训练负荷模型，而不是把恢复指标混在主要负荷指标区。

## Scope

- 核对 Open Design `index.html` 负荷总览的指标卡要求。
- 只处理总览页一个具体可验证差异：负荷指标卡字段/说明。
- 指标卡目标字段以 Open Design 为准：
  - Fatigue / ATL
  - Fitness / CTL
  - Stress Balance / TSB
  - Workload Ratio / A:C
  - Easy TRIMP
- 仅使用现有前端/后端已经提供的数据字段，或在缺失时显示诚实空态/`—`。
- 保留 HRV、静息心率、睡眠等恢复指标，但如需调整位置，只做最小结构调整。
- 更新 `Dashboard.test.tsx` 或相关测试，覆盖负荷指标卡字段和无数据诚实展示。

## Non-scope

- 不完整重写 Dashboard。
- 不完整实现 Open Design 视觉。
- 不改后端 API，除非执行时确认仅靠前端无法诚实表达且用户明确同意。
- 不改训练负荷算法。
- 不新增或伪造 Easy TRIMP 数据。
- 不制造 mock 数据。
- 不处理趋势图 tabs、来源切换或复制公式按钮。
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
- frontend/src/lib/types.ts
- frontend/src/lib/emptyData.ts

## Current Facts

- P0 主流程骨架与空态审计已完成。
- Dashboard 当前仍是 `partial`，但已完成总览结构标识切片。
- Open Design `index.html` 指标卡要求包含 Fatigue / ATL、Fitness / CTL、Stress Balance / TSB、Workload Ratio / A:C、Easy TRIMP。
- 当前 `Dashboard.tsx` 的主要负荷指标区包含 HRV、静息心率、睡眠、ACWR、体能 CTL。
- 当前 `Today` 类型和 `emptyData` 已有 `atl`、`ctl`、`tsb`、`acwr`，没有明确的 Easy TRIMP 字段。
- `decisions.md` 要求训练负荷由 Trainalyze 自算；无数据不能伪造，必须显示空值、`—` 或灰色空态。

## Open Questions

- Easy TRIMP 当前没有明确前端字段；本切片默认不得新增假值。若实现需要后端/API 字段或算法补充，必须先停止并向用户确认。

## Steps

- [x] 重新核对 Open Design 指标卡字段与当前 Dashboard hero 指标字段。
- [x] 设计最小 React 调整方案，优先复用 `HeroTile`、`HowInfo`、`SourceBadge` 和现有 `Today` 字段。
- [x] 将主要负荷指标区对齐到 ATL、CTL、TSB、A:C，并对 Easy TRIMP 缺失状态做诚实展示或停止确认。
- [x] 确认 HRV、静息心率、睡眠不被伪造成负荷指标；如保留，只做最小位置/语义调整。
- [x] 更新相关测试，覆盖指标卡字段、来源/公式说明和无数据不伪造。
- [x] 运行本计划要求的前端验证。
- [x] 更新 Harness 状态并移动本计划到 completed。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [x] 总览页负荷指标区可以识别 ATL、CTL、TSB、A:C。
- [x] Easy TRIMP 不存在真实字段时不显示伪造数值。
- [x] HRV、静息心率、睡眠不会被当作主要负荷指标卡冒充设计字段。
- [x] 来源证据/公式说明仍能说明负荷指标来自 Trainalyze 自算。
- [x] 无连接/无数据状态仍显示空态或 `—`，不新增 mock 数据。
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

- 已完成什么：总览负荷指标卡已对齐为 ATL、CTL、TSB、A:C 和 Easy TRIMP；Easy TRIMP 因缺少真实字段显示 `—` / 待算法字段；测试和 Harness 已更新。
- 下一步是什么：停止并汇报本切片结果，不自动进入下一个切片。
- 当前阻塞是什么：暂无阻塞；Easy TRIMP 真实算法/API 字段仍是后续增强边界。
