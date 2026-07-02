# Exec Plan: 总览页结构标识对齐

## Status

- State: completed
- Created: 2026-07-02
- Updated: 2026-07-02
- Owner: Codex
- Related design version: Open Design v0.1.0
- Related files:
  - frontend/src/App.tsx
  - frontend/src/modules/Dashboard.tsx
  - frontend/src/modules/Dashboard.test.tsx
  - frontend/src/App.test.tsx

## Goal

将当前 Dashboard 继续向 Open Design v0.1.0 的负荷总览结构对齐，用一个小而可验证的切片明确总览页核心区域，而不重写完整页面。

## Scope

- 核对当前 Dashboard 与 Open Design `index.html` 负荷总览结构的核心区域映射。
- 只处理一个可验证的结构差异：让总览页的关键区域在 React 和测试中更明确，包括负荷指标、体能趋势、来源证据/公式说明、下一次训练建议。
- 优先复用当前 Dashboard、Card、SourceBadge、HowInfo、EmptyState 等已有实现。
- 必要时做最小页面标题、区域标题、aria landmark 或测试断言调整。
- 更新相关前端测试计划和测试断言。

## Non-scope

- 不完整重写 Dashboard。
- 不完整实现 Open Design 视觉。
- 不改后端 API。
- 不改训练负荷算法。
- 不制造 mock 数据。
- 不处理活动详情、连接、健康、教练页面的内容对齐。
- 不实现登录/注册。
- 不做真实 LLM 接入。
- 不新增地图、路线或外部服务。

## Inputs

- AGENTS.md
- docs/harness/README.md
- docs/harness/project-status.md
- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md
- docs/harness/validation-and-delivery.md
- frontend/src/App.tsx
- frontend/src/modules/Dashboard.tsx
- frontend/src/modules/Dashboard.test.tsx
- frontend/src/App.test.tsx

## Current Facts

- P0 主流程骨架、首页总览入口、导航、健康二级菜单和空态审计已经完成。
- `decisions.md` 已确认 `index.html` / 首页职责是负荷总览，不恢复入口卡片页或 `dashboard.html`。
- `design-source-map.md` 标记 `index.html` -> `Dashboard.tsx` 当前状态为 `partial`。
- 当前 `Dashboard.tsx` 已有负荷指标区域、体能趋势、来源徽标、公式说明、下一次训练建议、AI 洞察、恢复和运动构成等区域。
- 当前 `Dashboard.test.tsx` 已覆盖负荷指标、Garmin/Trainalyze 来源徽标、如何计算、体能趋势、下一次训练建议和无连接空态。
- 当前缺口不是从零创建总览页，而是继续把 Open Design 负荷总览结构做成更清晰、可追踪、可测试的 React 结构映射。

## Open Questions

暂无阻塞。若实现时发现需要完整视觉重写、新后端字段、算法调整或新增假数据，停止并向用户确认。

## Steps

- [x] 重新核对 Dashboard 中现有负荷总览区域与 Open Design `index.html` 的结构对应关系。
- [x] 选择一个最小结构差异进行实现，优先使用区域标题、aria landmark 或现有模块重排这类低风险变更。
- [x] 更新 `Dashboard.test.tsx` 或 `App.test.tsx`，让该结构差异有明确断言。
- [x] 确认无连接/无数据状态仍诚实展示，不新增假数据。
- [x] 运行本计划要求的前端验证。
- [x] 更新 Harness 状态并移动本计划到 completed。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [x] 默认首页仍是总览 / 负荷总览入口。
- [x] 总览页仍包含负荷指标、体能趋势、来源证据/公式说明、下一次训练建议这些核心结构。
- [x] 本切片只改变一个小的、可验证的 Dashboard 结构差异。
- [x] 没有恢复入口卡片页、`dashboard.html` 或旧导航。
- [x] 没有新增 mock 数据或伪造无数据状态。
- [x] 相关测试覆盖本切片的结构要求。

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [x] Frontend lint: `npm run lint` passed.
- [x] Frontend tests: `npm run test:run` passed.
- [x] Frontend typecheck: `npm run typecheck` passed.
- [x] Frontend build: `npm run build` passed.
- [x] Backend ruff: N/A，本切片未改后端。
- [x] Backend pytest: N/A，本切片未改后端。

不复制所有全局验证规则；本计划只记录本切片需要运行的验证。

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

- 已完成什么：Dashboard 已补充负荷总览核心区域的可测试命名结构；相关测试已更新；前端验证已通过；Harness 状态已更新。
- 下一步是什么：停止并汇报本切片结果，不自动进入下一个切片。
- 当前阻塞是什么：暂无阻塞。
