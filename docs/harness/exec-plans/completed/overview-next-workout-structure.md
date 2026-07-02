# Exec Plan: 总览页下一次训练建议结构

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
  - frontend/src/App.test.tsx

## Goal

对齐 Open Design v0.1.0 的总览页“下一次训练”最小结构，使当前 Dashboard 的下一次训练建议区域更接近设计中的强度、原因、后续证据结构，同时保持无数据时不伪造建议。

## Scope

- 只调整 Dashboard 中现有 `NextWorkoutCard` 的最小结构。
- 有真实 `workout` 数据时，展示下一次训练标题、状态、强度、原因、后续等结构化信息或等价映射。
- 仅使用当前 `ApexData.workout` 已有字段，不新增后端 API，不推断不存在的数据。
- 无 `workout` 数据时继续显示空态，并明确当前不生成假建议。
- 更新 `frontend/src/modules/Dashboard.test.tsx` 中与下一次训练建议相关的测试计划。

## Non-scope

- 不完整重写 Dashboard。
- 不实现完整 Open Design 视觉。
- 不改后端 API。
- 不改训练负荷算法。
- 不制造 mock 数据。
- 不实现真实训练计划生成。
- 不实现登录/注册。
- 不处理活动详情、健康、连接、教练页面。
- 不处理总览页趋势 tabs 交互。

## Inputs

- AGENTS.md
- docs/harness/README.md
- docs/harness/project-status.md
- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md
- docs/harness/validation-and-delivery.md
- docs/harness/exec-plans/TEMPLATE.md
- Open Design `index.html` 中 `data-od-id="next-session"` 区域
- frontend/src/modules/Dashboard.tsx
- frontend/src/modules/Dashboard.test.tsx
- frontend/src/App.test.tsx
- frontend/src/lib/types.ts
- frontend/src/lib/emptyData.ts

## Current Facts

- Open Design `index.html` 的 `next-session` 区域包含“下一次训练”面板，并展示强度、原因、后续三行证据。
- 当前 `Dashboard.tsx` 已有 `NextWorkoutCard`，标题为“下一次训练建议”。
- 当前 `NextWorkoutCard` 有 `workout.title` 时展示标题、时间、项目、时长、目标负荷、目标和 `rationale`。
- 当前 `NextWorkoutCard` 无 `workout.title` 时展示“暂无下一次训练建议”，并说明当前不生成假建议。
- 当前 `ApexData.workout` 字段包含 `title`、`sport`、`when`、`target`、`load`、`duration`、`rationale`、`steps`。
- 当前测试已覆盖：有 workout 数据时渲染建议；无 workout 数据时显示空态。

## Open Questions

暂无阻塞。若实现时发现必须新增训练建议字段、后端接口、算法推断或伪造建议，停止并向用户确认。

## Steps

- [x] 读取计划列出的 Harness、Open Design、代码和测试输入。
- [x] 在 `NextWorkoutCard` 中把已有 workout 字段映射到最小“强度 / 原因 / 后续”结构。
- [x] 保持无 workout 数据时的空态，不展示假训练建议。
- [x] 更新 Dashboard 测试，覆盖结构化建议和空态边界。
- [x] 运行本计划要求的前端验证。
- [x] 更新 Harness 状态并把计划移到 completed。
- [x] commit 并 push。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [x] 总览页仍有可访问的“下一次训练建议”区域。
- [x] 有真实 workout 数据时，下一次训练建议区域展示类似 Open Design 的强度、原因、后续结构。
- [x] 强度、原因、后续只能来自当前 workout 字段或明确的空值占位，不凭空生成训练结论。
- [x] 无 workout 数据时继续显示空态，不显示假课程、假强度、假原因或假后续。
- [x] 不改后端、不改训练负荷算法、不接入新 API。
- [x] 相关测试覆盖有数据和无数据两个路径。

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [x] Frontend lint: `npm run lint` passed
- [x] Frontend tests: `npm run test:run` passed, 16 files / 73 tests
- [x] Frontend typecheck: `npm run typecheck` passed
- [x] Frontend build: `npm run build` passed
- [x] Backend ruff: N/A，本切片不改后端。
- [x] Backend pytest: N/A，本切片不改后端。

不复制所有全局验证规则；以 `validation-and-delivery.md` 为准。

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

- 已完成什么：`NextWorkoutCard` 已补充“强度 / 原因 / 后续”证据结构；Dashboard 测试覆盖有数据和无数据路径；前端 lint/test/typecheck/build 均已通过；Harness 状态已回写。
- 下一步是什么：本计划已完成；停止，不自动进入下一个切片。
- 当前阻塞是什么：暂无阻塞。
