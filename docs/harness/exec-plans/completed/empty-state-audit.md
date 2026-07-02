# Exec Plan: 主流程空态诚实展示审计

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
  - frontend/src/modules/Records.tsx
  - frontend/src/modules/Weight.tsx
  - frontend/src/modules/Connectors.tsx
  - frontend/src/modules/AIModule.tsx
  - frontend/src/App.test.tsx
  - frontend/src/modules/Dashboard.test.tsx
  - frontend/src/modules/Records.test.tsx
  - frontend/src/modules/Connectors.test.tsx
  - frontend/src/modules/AIModule.test.tsx

## Goal

核对主流程页面在无连接/无数据状态下不伪造数据，并补齐必要测试或最小空态修正。

## Scope

本切片只包含：

- 审计总览、活动、健康、连接、教练主流程的无连接/无数据状态。
- 检查是否存在为设计效果制造的假数据。
- 必要时做最小空态文案或测试修正。
- 更新相关测试计划。

## Non-scope

本切片明确不包括：

- 不重写完整页面。
- 不接入新后端 API。
- 不新增 mock 数据。
- 不实现完整 Open Design 视觉。
- 不改训练负荷算法。
- 不实现真实认证或 LLM。

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
- frontend/src/lib/emptyData.ts
- frontend/src/modules/Dashboard.tsx
- frontend/src/modules/Records.tsx
- frontend/src/modules/Weight.tsx
- frontend/src/modules/Connectors.tsx
- frontend/src/modules/AIModule.tsx
- frontend/src/App.test.tsx
- frontend/src/modules/Dashboard.test.tsx
- frontend/src/modules/Records.test.tsx
- frontend/src/modules/Connectors.test.tsx
- frontend/src/modules/AIModule.test.tsx

## Current Facts

- `decisions.md` 明确：无数据不能伪造，必须显示空值、`—` 或灰色空态。
- `emptyData.ts` 是结构完整但空的数据骨架；注释说明 mock data 已移除。
- `App.tsx` 初始使用 `emptyData`，后端不可用时保持空骨架。
- 总览页未连接时显示 `尚未连接数据源` 和灰色占位卡；已有测试覆盖。
- 活动页未连接或已连接但无活动时显示 `暂无运动记录`。
- 健康睡眠页是骨架文案，明确“不伪造同步数据”。
- 健康体重页无记录时现在显示 `暂无体重记录`，不再绘制空数据曲线。
- 连接页未连接时显示 `尚未连接佳明` 和 Garmin 登录入口；已有测试覆盖不展示数据源市场。
- 教练页无同步数据时现在显示 `运动科学专家 · 等待同步数据`，并提示等待同步，不再声称已载入近 14 天数据或展示硬编码生理指标。

## Open Questions

暂无阻塞。

后续如果需要真实 LLM 数据引用策略、训练负荷参数或后端字段，需另建 exec plan 并向用户确认。

## Steps

- [x] 重新读取本 plan、Harness 文档、主流程页面代码和相关测试。
- [x] 审计总览页无连接/无数据状态，确认不展示真实数据样式的假指标。
- [x] 审计活动页无连接/无活动状态，确认不展示假活动记录。
- [x] 审计健康页睡眠/体重无数据状态，确认睡眠不伪造同步数据，体重无记录时图表和指标稳定。
- [x] 审计连接页无连接状态，确认只展示 Garmin 真实连接入口和 coming-soon 提示，不展示假连接数据。
- [x] 审计教练页无数据状态，优先处理硬编码“已载入近 14 天数据 / 就绪度 78 / 睡眠 7.4h”等风险。
- [x] 在必要时做最小空态文案或测试修正，不扩大为页面重写。
- [x] 更新 `App.test.tsx` 及相关模块测试，覆盖主流程空态和非伪造约束。
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

- [x] 总览页无连接时只显示空态或连接后显示占位，不展示假训练数据。
- [x] 活动页无连接/无活动时不展示假活动记录。
- [x] 健康睡眠页不展示假睡眠同步数据。
- [x] 健康体重页无体重记录时显示空值或空态，且不因空数组渲染异常。
- [x] 连接页无连接时不展示假已连接状态、假同步记录或假数据源市场。
- [x] 教练页无数据时不声称已载入真实训练/健康数据，不展示硬编码生理指标作为事实。
- [x] 不新增 mock 数据、seed 数据或设计演示数据。
- [x] 相关测试覆盖上述主流程空态和非回归约束。

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [x] Frontend lint: `npm run lint` passed.
- [x] Frontend tests: `npm run test:run` passed, 16 files / 72 tests.
- [x] Frontend typecheck: `npm run typecheck` passed.
- [x] Frontend build: `npm run build` passed.
- [x] Backend ruff: N/A，本切片未改后端代码。
- [x] Backend pytest: N/A，本切片未改后端代码。

## Delivery

参考 docs/harness/validation-and-delivery.md。

- 是否需要更新 project-status.md: yes，已记录主流程空态审计状态。
- 是否需要更新 backlog.md: yes，已回写 P0 空态项并重新评估 Suggested next slice。
- 是否需要更新 decisions.md: no，本切片未产生新决策。
- 是否需要 commit/push: yes，功能完成后 commit 并 push。
- Backlog source item: P0 `保持无连接/无数据状态诚实展示，避免为设计效果制造数据`
- Backlog update required: yes
- Completion effect: done
- Suggested next slice needs review: yes

## Resume Point

- 已完成什么：主流程空态审计完成；教练页空数据硬编码风险已修正；体重空记录图表已改为空态；测试和 Harness 已回写。
- 下一步是什么：如果继续推进，按 backlog 当前 Suggested next slice 创建新的 active exec plan；不要自动开始实现。
- 当前阻塞是什么：暂无阻塞。
