# Exec Plan: 总览页头部骨架

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
  - docs/harness/design-source-map.md
  - docs/harness/decisions.md
  - docs/harness/backlog.md
  - docs/harness/validation-and-delivery.md
  - frontend/src/App.tsx
  - frontend/src/components/Topbar.tsx
  - frontend/src/modules/Dashboard.tsx
  - frontend/src/App.test.tsx
  - frontend/src/modules/Dashboard.test.tsx

## Goal

对齐 Open Design v0.1.0 中 `dashboard-head` 的最小头部骨架，让总览页在 Topbar 之外具备“今日负荷模型”、决策型标题、解释文案和状态标签的页面头部。

## Scope

- 只调整 Dashboard 总览页内部的头部骨架。
- 增加或调整“今日负荷模型”eyebrow、决策型标题、说明文案。
- 增加最小状态标签，表达 Garmin 连接/同步状态和健康数据窗口状态。
- 状态标签只能基于现有 `connected`、`data.activities`、`data.sleep`、`data.weightLog` 等已有前端数据判断。
- 更新 `frontend/src/modules/Dashboard.test.tsx` 或 `frontend/src/App.test.tsx` 中相关测试。

## Non-scope

- 不完整重写 Dashboard。
- 不实现完整 Open Design 视觉。
- 不改变 Topbar 的全局导航职责。
- 不改指标卡、体能趋势 tabs、下一次训练建议。
- 不改后端 API。
- 不改训练负荷算法。
- 不制造 mock 数据。
- 不处理活动、健康、连接、教练页面。

## Inputs

- AGENTS.md
- docs/harness/README.md
- docs/harness/project-status.md
- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md
- docs/harness/validation-and-delivery.md
- docs/harness/exec-plans/TEMPLATE.md
- Open Design `index.html` 中 `data-od-id="dashboard-head"` 区域
- frontend/src/App.tsx
- frontend/src/components/Topbar.tsx
- frontend/src/modules/Dashboard.tsx
- frontend/src/App.test.tsx
- frontend/src/modules/Dashboard.test.tsx

## Current Facts

- Open Design `index.html` 的 `dashboard-head` 包含 eyebrow `今日负荷模型`、决策型 H1、解释文案和两个状态 pill。
- 当前 `App.tsx` 的 dashboard Topbar 标题为 `总览`，副标题为 `林越 · 综合运动训练 · 2026-06-18`。
- 当前 `Dashboard.tsx` 没有独立的 `dashboard-head` 页面头部；内容直接从无连接空态或负荷指标区域开始。
- 当前无连接状态必须诚实展示，不允许声称 Garmin 已同步或健康数据已补全。
- 当前 Dashboard 测试已覆盖总览入口、空态、负荷指标、体能趋势 tabs 和下一次训练建议。

## Open Questions

暂无阻塞。若实现时需要新增用户姓名、训练日期、Garmin 同步时间、健康窗口完整度接口或精确文案策略，停止并向用户确认。

## Steps

- [x] 读取计划列出的 Harness、Open Design、代码和测试输入。
- [x] 在 Dashboard connected 路径中加入最小 `dashboard-head` 结构。
- [x] 在 Dashboard unconnected 路径中加入或保留诚实头部状态，不声称已同步。
- [x] 状态标签只使用现有数据判断，不新增数据契约。
- [x] 更新相关测试，覆盖有连接和无连接两种头部状态。
- [x] 运行本计划要求的前端验证。
- [x] 更新 Harness 状态并把计划移到 completed。
- [x] commit 并 push。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [x] 总览页 Dashboard 内部存在可测试的 `今日负荷模型` 头部骨架。
- [x] 头部包含决策型标题和说明文案，职责对应 Open Design `dashboard-head`。
- [x] connected 有真实数据时，状态标签可显示 Garmin/健康窗口的最小状态。
- [x] unconnected 或无数据时，状态标签不声称 Garmin 已同步或健康数据已补全。
- [x] 不改变 Topbar 的全局标题职责。
- [x] 不改后端、不改算法、不制造数据。
- [x] 相关测试覆盖有连接和无连接路径。

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [x] Frontend lint: `npm run lint` passed
- [x] Frontend tests: `npm run test:run` passed, 16 files / 74 tests
- [x] Frontend typecheck: `npm run typecheck` passed
- [x] Frontend build: `npm run build` passed
- [x] Backend ruff: N/A，本切片不改后端。
- [x] Backend pytest: N/A，本切片不改后端。

不需要的项目写 `N/A` 和原因。不要在本计划里复制所有全局验证规则。

## Delivery

参考 docs/harness/validation-and-delivery.md。

- 是否需要更新 project-status.md: yes
- 是否需要更新 backlog.md: yes
- 是否需要更新 decisions.md: no，除非实现中产生新决策
- 是否需要 commit/push: yes，功能完成后需要
- Backlog source item: P1 - 将当前 Dashboard 调整为 Open Design 的负荷总览结构
- Backlog update required: yes
- Completion effect: partial
- Suggested next slice needs review: yes

## Resume Point

- 已完成什么：总览页内部 `今日负荷模型` 头部骨架已实现；状态标签基于现有数据判断；有连接和无连接路径测试已覆盖；前端 lint/test/typecheck/build 均已通过；Harness 状态已回写。
- 下一步是什么：本计划已完成；停止，不自动进入下一个切片。
- 当前阻塞是什么：暂无阻塞。
