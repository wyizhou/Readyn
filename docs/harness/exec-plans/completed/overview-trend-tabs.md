# Exec Plan: 总览页体能趋势 Tabs

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

对齐 Open Design v0.1.0 中总览页体能趋势面板的最小 tab 结构，让“每日 / 来源 / 公式”成为可访问、可测试的切换入口，同时保持现有数据边界和趋势图能力。

## Scope

- 只调整 Dashboard 中现有体能趋势卡片的最小 tab/tabpanel 结构。
- 增加或调整“每日 / 来源 / 公式”三个 tab 入口。
- “每日”展示现有 PMC 趋势图和图例。
- “来源”展示现有来源证据内容。
- “公式”展示现有公式摘要内容。
- 更新 `frontend/src/modules/Dashboard.test.tsx` 中与体能趋势 tab 切换相关的测试。

## Non-scope

- 不完整重写 Dashboard。
- 不实现完整 Open Design 视觉。
- 不改 PMC 图表算法或负荷计算。
- 不新增或修改后端 API。
- 不制造 mock 数据。
- 不调整下一次训练建议、活动、健康、连接、教练页面。
- 不处理完整响应式视觉密度对齐。

## Inputs

- AGENTS.md
- docs/harness/README.md
- docs/harness/project-status.md
- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md
- docs/harness/validation-and-delivery.md
- docs/harness/exec-plans/TEMPLATE.md
- Open Design `index.html` 中 `data-tab-group` 的体能趋势区域
- frontend/src/modules/Dashboard.tsx
- frontend/src/modules/Dashboard.test.tsx

## Current Facts

- Open Design `index.html` 的负荷趋势面板使用 `data-tab-group`，包含“每日 / 来源 / 公式”三个 tab。
- Open Design 中“每日”面板展示趋势图，“来源”面板展示来源列表，“公式”面板展示公式摘要。
- 当前 `Dashboard.tsx` 已有“体能趋势”区域和 `PMCChart`。
- 当前 `Dashboard.tsx` 已有来源证据和公式摘要结构，但它们和趋势图同时展示，不是 tab 切换。
- 当前 `Dashboard.test.tsx` 已测试体能趋势区域、来源证据和公式摘要存在。
- 当前实现固定显示“近 6 周 · 体能 / 疲劳 / 状态”，并移除了旧 7 天 / 28 天 / 赛季时间范围切换。

## Open Questions

暂无阻塞。此前 `npm run test:run` 的 hidden tabpanel 断言已改为直接检查 DOM `hidden` 属性，避免 jsdom CSS shorthand clone bug。

## Steps

- [x] 读取计划列出的 Harness、Open Design、代码和测试输入。
- [x] 在体能趋势卡中加入最小可访问 tablist：每日 / 来源 / 公式。
- [x] 将现有 PMC 图表、来源证据、公式摘要分别挂到对应 tabpanel。
- [x] 保持现有 “近 6 周”窗口和图表数据逻辑不变。
- [x] 更新 Dashboard 测试，覆盖默认 tab 和切换到来源/公式。
- [x] 运行本计划要求的前端验证。
- [x] 更新 Harness 状态并把计划移到 completed。
- [x] commit 并 push。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [x] 体能趋势卡存在 `tablist`，包含“每日 / 来源 / 公式”三个 tab。
- [x] 默认展示“每日”内容，包含现有 PMC 趋势图或等价图表容器。
- [x] 切换“来源”后展示来源证据，并隐藏非当前 tabpanel 的主要内容。
- [x] 切换“公式”后展示公式摘要，并隐藏非当前 tabpanel 的主要内容。
- [x] 不恢复旧的 7 天 / 28 天 / 赛季时间范围切换。
- [x] 不改后端、不改负荷算法、不制造数据。
- [x] 相关测试覆盖 tab 默认状态和切换行为。

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

- 已完成什么：体能趋势“每日 / 来源 / 公式”最小 tab 结构已实现；Dashboard 测试覆盖默认 tab 和来源/公式切换；前端 lint/test/typecheck/build 均已通过；Harness 状态已回写。
- 下一步是什么：本计划已完成；停止，不自动进入下一个切片。
- 当前阻塞是什么：暂无阻塞。
