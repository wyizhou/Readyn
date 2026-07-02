# Exec Plan: 总览页负荷决策骨架

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
  - frontend/src/modules/Dashboard.tsx
  - frontend/src/modules/Dashboard.test.tsx

## Goal

对齐 Open Design v0.1.0 中 `readiness-score` 的最小负荷决策骨架，让总览页的 readiness hero 从泛化“今日状态”转为明确的“负荷决策”说明区，同时保留现有分数/ring 和真实数据边界。

## Scope

- 只调整 Dashboard 中现有 readiness hero / 负荷指标区域的左侧决策文案与状态骨架。
- 将现有“今日状态 / 状态均衡 / 可承接强度”最小对齐为 Open Design 的“负荷决策”语义。
- 保留现有 readiness ring 和 ATL/CTL/TSB/A:C/Easy TRIMP 指标卡结构。
- 根据现有 `today.tsb`、`connected` 和健康数据窗口显示诚实的决策文案，不新增后端字段。
- 更新 `frontend/src/modules/Dashboard.test.tsx` 中相关测试。

## Non-scope

- 不完整重写 Dashboard。
- 不实现完整 Open Design 视觉。
- 不新增“安排轻松训练”或“复制公式”的真实交互。
- 不改负荷算法、readiness 分数、ATL/CTL/TSB/A:C/Easy TRIMP 计算。
- 不改后端 API。
- 不制造 mock 数据。
- 不调整体能趋势 tabs、下一次训练建议、活动、健康、连接、教练页面。

## Inputs

- AGENTS.md
- docs/harness/README.md
- docs/harness/project-status.md
- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md
- docs/harness/validation-and-delivery.md
- docs/harness/exec-plans/TEMPLATE.md
- Open Design `index.html` 中 `data-od-id="readiness-score"` 区域
- frontend/src/modules/Dashboard.tsx
- frontend/src/modules/Dashboard.test.tsx

## Current Facts

- Open Design `readiness-score` 区域包含 eyebrow `负荷决策`、一句决策型标题、解释文案和负荷状态分数 ring。
- 当前 `Dashboard.tsx` connected 路径已有 readiness ring，并在左侧显示 `今日状态`、`状态均衡`、`可承接强度`。
- 当前负荷指标区域已包含可测试 region `负荷指标`，并展示 ATL、CTL、TSB、A:C、Easy TRIMP。
- 当前 `DashboardHead` 已承担 `今日负荷模型` 页面头部；本切片不再修改该头部。
- 当前无数据不能伪造；如果健康数据窗口不足，文案应说明待补全或保持谨慎。

## Open Questions

暂无阻塞。若实现时需要新增按钮真实行为、复制公式行为、训练安排行为、健康窗口完整度 API 或修改 readiness/负荷算法，停止并向用户确认。

## Steps

- [x] 读取计划列出的 Harness、Open Design、代码和测试输入。
- [x] 在 Dashboard readiness hero 左侧加入最小“负荷决策”语义。
- [x] 根据现有 TSB/健康窗口生成有限、诚实的决策文案。
- [x] 保留 readiness ring 和指标卡结构，不改算法或数据契约。
- [x] 更新 Dashboard 测试，覆盖负荷决策文案和不伪造健康窗口的状态。
- [x] 运行本计划要求的前端验证。
- [x] 更新 Harness 状态并把计划移到 completed。
- [x] commit 并 push。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [x] `负荷指标` 区域中存在 `负荷决策` 语义文本。
- [x] readiness hero 显示决策型说明，而不是仅显示泛化 `今日状态`。
- [x] 健康数据窗口不足时，文案或状态不声称健康数据已完整。
- [x] readiness ring 和 ATL/CTL/TSB/A:C/Easy TRIMP 指标卡仍存在。
- [x] 不新增真实训练安排/复制公式交互。
- [x] 不改后端、不改负荷算法、不制造数据。
- [x] 相关测试覆盖该骨架。

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [x] Frontend lint: `npm run lint` passed.
- [x] Frontend tests: `npm run test:run` passed, 16 files / 74 tests.
- [x] Frontend typecheck: `npm run typecheck` passed.
- [x] Frontend build: `npm run build` passed.
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

- 已完成什么：总览页 readiness hero 已对齐为最小“负荷决策”骨架；相关 Dashboard 测试与前端验证已通过；Harness 状态已同步。
- 下一步是什么：本切片完成后停止，等待用户确认下一个 exec plan。
- 当前阻塞是什么：暂无阻塞。
