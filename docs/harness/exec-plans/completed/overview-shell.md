# Exec Plan: 首页负荷总览最小骨架对齐

## Status

- State: completed
- Created: 2026-07-02
- Updated: 2026-07-02
- Owner: Codex
- Related design version: Open Design v0.1.0
- Related files:
  - AGENTS.md
  - docs/harness/README.md
  - docs/harness/project-status.md
  - docs/harness/backlog.md
  - docs/harness/decisions.md
  - docs/harness/design-source-map.md
  - docs/harness/validation-and-delivery.md
  - frontend/src/App.tsx
  - frontend/src/modules/Dashboard.tsx
  - frontend/src/modules/Dashboard.test.tsx
  - frontend/src/App.test.tsx

## Goal

确认首页 / `index.html` 对应负荷总览，并建立总览页最小骨架对齐。

## Scope

本切片只包含：

- 确认默认入口是总览 view。
- 确认 Topbar / 页面标题使用“总览”或“负荷总览”。
- 确认不恢复入口卡片页或 `dashboard.html`。
- 对齐总览页最小骨架：负荷指标、趋势、来源证据、公式说明、下一次训练建议这些区域可以作为最小结构或现有模块映射。
- 更新相关测试计划。

## Non-scope

本切片明确不包括：

- 不完整重写 Dashboard。
- 不完整实现 Open Design 视觉。
- 不改后端 API。
- 不改训练负荷算法。
- 不制造 mock 数据。
- 不实现登录/注册。
- 不处理活动详情、连接、教练页面。

## Inputs

执行本计划时已读取：

- AGENTS.md
- docs/harness/README.md
- docs/harness/project-status.md
- docs/harness/backlog.md
- docs/harness/decisions.md
- docs/harness/design-source-map.md
- docs/harness/validation-and-delivery.md
- frontend/src/App.tsx
- frontend/src/modules/Dashboard.tsx
- frontend/src/modules/Dashboard.test.tsx
- frontend/src/App.test.tsx
- frontend/src/lib/types.ts
- frontend/src/lib/emptyData.ts
- frontend/src/components/SourceBadge.tsx
- frontend/src/components/EmptyState.tsx

## Current Facts

- `decisions.md` 已确认 `index.html` / 首页职责是负荷总览，不是入口卡片页。
- `design-source-map.md` 将 `index.html` 映射到 `frontend/index.html`、`frontend/src/App.tsx` 和 `frontend/src/modules/Dashboard.tsx`，当前状态为 `partial`。
- `App.tsx` 当前默认 `view` 是 `dashboard`。
- `App.tsx` 当前 `dashboard` Topbar 标题为“总览”。
- 当前未发现 `dashboard.html` 作为前端入口；`frontend/index.html` 是主应用入口。
- `Dashboard.tsx` 已有负荷指标、体能趋势、Trainalyze 自算来源、公式说明、AI 洞察和运动构成等区域。
- 本切片新增的“下一次训练建议”只读取现有 `data.workout`；无 workout 时显示空态，不生成假建议。
- `Dashboard.test.tsx` 和 `App.test.tsx` 已覆盖默认总览入口、无入口卡片页、来源/公式说明、下一次训练建议骨架和无连接空态。

## Open Questions

暂无阻塞。

后续如果要把“下一次训练建议”升级为真实算法推荐、训练负荷参数推导或后端字段，需要先向用户确认；本切片只完成最小骨架和现有数据映射。

## Steps

- [x] 重新读取本 plan、Harness 相关文档和总览相关代码/测试。
- [x] 确认 `App.tsx` 默认入口仍是 `dashboard`，且不会恢复入口卡片页或 `dashboard.html`。
- [x] 梳理 Dashboard 当前结构，保留可复用的负荷指标、趋势、来源证据和公式说明区域。
- [x] 在最小范围内补齐或标注“下一次训练建议”骨架，确保无真实数据时不伪造结论。
- [x] 更新 `Dashboard.test.tsx` / `App.test.tsx`，覆盖默认总览入口、总览标题、无入口卡片页、最小骨架区域。
- [x] 运行本切片需要的前端验证。
- [x] 更新 `project-status.md` 和 `backlog.md`。
- [x] 如无新决策，不更新 `decisions.md`。
- [x] 将本 plan 移到 `docs/harness/exec-plans/completed/`，记录完成情况、验证结果和 Resume Point。
- [x] commit 并 push。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [x] 主应用默认入口仍为总览 / dashboard view。
- [x] Topbar / 页面标题显示“总览”或“负荷总览”。
- [x] 未恢复入口卡片页或 `dashboard.html`。
- [x] 总览页存在负荷指标区域。
- [x] 总览页存在趋势区域。
- [x] 总览页存在来源证据或来源说明区域。
- [x] 总览页存在公式说明入口或说明结构。
- [x] 总览页存在下一次训练建议的最小骨架或明确空态。
- [x] 无连接 / 无数据时不制造 mock 数据，继续显示真实空态。
- [x] 相关测试覆盖上述最小骨架和非回归约束。

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [x] Frontend lint: `npm run lint` passed.
- [x] Frontend tests: `npm run test:run` passed, 16 files / 71 tests.
- [x] Frontend typecheck: `npm run typecheck` passed.
- [x] Frontend build: `npm run build` passed.
- [x] Backend ruff: N/A，本切片未改后端代码。
- [x] Backend pytest: N/A，本切片未改后端代码。

## Delivery

参考 docs/harness/validation-and-delivery.md。

- 是否需要更新 project-status.md: yes，已记录首页负荷总览最小骨架状态。
- 是否需要更新 backlog.md: yes，已回写 P0 首页总览项并重新评估 Suggested next slice。
- 是否需要更新 decisions.md: no，本切片未产生新决策。
- 是否需要 commit/push: yes，功能完成后 commit 并 push。
- Backlog source item: P0 `确认首页为负荷总览，不恢复入口卡片页或 dashboard.html`
- Backlog update required: yes
- Completion effect: done
- Suggested next slice needs review: yes

## Resume Point

- 已完成什么：首页 / `index.html` 已确认对应总览入口；Dashboard 已补齐下一次训练建议最小骨架和可测试结构边界；Harness 状态已回写。
- 下一步是什么：如继续推进，建议基于 backlog 当前 Suggested next slice 创建“主流程空态检查” active exec plan。
- 当前阻塞是什么：暂无阻塞。
