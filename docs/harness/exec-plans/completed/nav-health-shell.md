# Exec Plan: 主导航和健康二级菜单骨架对齐

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
  - frontend/src/App.tsx
  - frontend/src/components/Sidebar.tsx
  - frontend/src/components/Topbar.tsx
  - frontend/src/App.test.tsx
  - frontend/src/App.disconnect.test.tsx

## Goal

对齐 Open Design v0.1.0 的主导航和健康二级菜单骨架。

## Scope

- 主导航命名和顺序对齐为 `01 总览` / `02 活动` / `03 健康` / `04 连接` / `05 教练`。
- 健康作为唯一二级菜单。
- 健康二级菜单只包含 `睡眠` / `体重`。
- 页面入口或标题骨架对齐。
- 相关测试计划。

## Non-scope

- 不重写完整 Dashboard / Records / ActivityDetail。
- 不实现完整 Open Design 视觉。
- 不接入新的后端 API。
- 不改训练负荷算法。
- 不实现真实认证。
- 不做 AI 教练真实 LLM 接入。

## Inputs

本任务已读取：

- AGENTS.md
- docs/harness/README.md
- docs/harness/project-status.md
- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md
- docs/harness/exec-plans/TEMPLATE.md
- docs/harness/validation-and-delivery.md
- frontend/src/App.tsx
- frontend/src/components/Sidebar.tsx
- frontend/src/components/Topbar.tsx
- frontend/src/App.test.tsx
- frontend/src/App.disconnect.test.tsx

## Current Facts

- Open Design v0.1.0 要求主导航固定为 `01 总览`、`02 活动`、`03 健康`、`04 连接`、`05 教练`。
- Open Design v0.1.0 要求健康是唯一二级菜单，且当前只包含 `睡眠`、`体重`。
- 实现前 `Sidebar.tsx` 主导航为 `看板`、`运动记录`、`体重记录`、`连接器`、`AI 模块`。
- 实现前没有 `健康` 主导航项，也没有 `睡眠` / `体重` 二级菜单。
- 实现后 `Sidebar.tsx` 主导航为 `01 总览`、`02 活动`、`03 健康`、`04 连接`、`05 教练`。
- 实现后健康为唯一二级菜单，包含 `睡眠` 和 `体重`。
- 实现后 `WeightModule` 通过健康/体重入口进入；睡眠入口为最小骨架，不伪造同步数据。

## Open Questions

暂无阻塞。URL/hash、完整健康页接口、完整睡眠数据展示留给后续切片确认。

## Steps

- [x] 重新读取本 exec plan、Open Design 映射、`decisions.md` 和当前导航相关代码。
- [x] 确认最小可行的 view/state 命名方案，不扩大到完整页面重构。
- [x] 调整主导航文案和顺序为 `01 总览` / `02 活动` / `03 健康` / `04 连接` / `05 教练`。
- [x] 为健康增加唯一二级菜单骨架：`睡眠` / `体重`。
- [x] 对齐相关页面入口或 Topbar 标题骨架。
- [x] 更新导航相关测试，覆盖主导航顺序、健康二级菜单和切换行为。
- [x] 运行本计划列出的前端验证。
- [x] 根据结果更新 Harness 文档和交付状态。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [x] 主导航只呈现设计要求的 5 个主项，顺序为 `01 总览` / `02 活动` / `03 健康` / `04 连接` / `05 教练`。
- [x] 健康是唯一二级菜单。
- [x] 健康二级菜单只包含 `睡眠` / `体重`。
- [x] 点击主导航能进入对应页面骨架或现有模块映射入口。
- [x] 健康二级菜单切换能展示对应标题或入口骨架。
- [x] 旧导航文案 `看板`、`运动记录`、`体重记录`、`连接器`、`AI 模块` 不再作为主导航标签出现。
- [x] 不改后端 API、训练负荷算法、真实认证、AI LLM 接入。
- [x] 相关前端测试覆盖导航顺序和健康二级菜单。

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [x] Frontend lint: `npm run lint` passed.
- [x] Frontend tests: `npm run test:run` passed. 16 test files passed, 70 tests passed.
- [x] Frontend typecheck: `npm run typecheck` passed.
- [x] Frontend build: `npm run build` passed.
- [x] Backend ruff: N/A，本切片未改后端代码。
- [x] Backend pytest: N/A，本切片未改后端代码。

## Delivery

参考 docs/harness/validation-and-delivery.md。

- 是否需要更新 project-status.md: yes，已更新导航骨架状态。
- 是否需要更新 backlog.md: yes，已回写 P0 项并重新评估 Suggested next slice。
- 是否需要更新 decisions.md: no，本切片未产生新决策。
- 是否需要 commit/push: yes，完成后按 AGENTS.md 本地 commit 并 push GitHub。
- Backlog source item: P0 `对齐主导航为 01-05`，P0 `明确健康页最小范围`。
- Backlog update required: yes
- Completion effect: partial
- Suggested next slice needs review: yes，已更新为建立 Open Design 到当前 React 模块的最小页面映射。

## Resume Point

- 已完成什么：主导航和健康二级菜单骨架已实现；相关测试已更新；前端 lint/test/typecheck/build 均通过；Harness 状态已更新。
- 下一步是什么：提交并 push；后续功能应从新的 `Suggested next slice` 创建 exec plan 后再开始。
- 当前阻塞是什么：暂无阻塞。
