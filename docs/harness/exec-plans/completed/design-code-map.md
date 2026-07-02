# Exec Plan: Open Design 到 React 模块最小页面映射

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
  - frontend/src/components/Sidebar.tsx
  - frontend/src/components/Topbar.tsx
  - frontend/src/modules/Dashboard.tsx
  - frontend/src/modules/Records.tsx
  - frontend/src/modules/Weight.tsx
  - frontend/src/modules/Connectors.tsx
  - frontend/src/modules/AIModule.tsx
  - frontend/src/details/ActivityDetail.tsx
  - related frontend tests under `frontend/src/**/*.test.tsx`

## Goal

建立 Open Design v0.1.0 页面到当前 React 模块、入口和测试覆盖的最小映射，让后续 P0/P1 切片不依赖猜测选择改动范围。

## Scope

- 梳理 Open Design 页面清单与当前 React 入口/模块的对应关系。
- 标记每个设计页面当前状态：aligned / partial / missing / needs-confirmation。
- 标记每个页面的主要现有代码文件和相关测试文件。
- 标记每个页面下一步最小切片建议。
- 更新 Harness 文档以保存这个映射。

## Non-scope

- 不实现产品功能。
- 不重写 Dashboard / Records / ActivityDetail / Health / Connectors / AI 页面。
- 不调整视觉样式。
- 不接入新的后端 API。
- 不改数据模型、训练负荷算法、认证、AI LLM 或地图服务。
- 不把 Open Design HTML 原样复制到生产代码。

## Inputs

执行本计划时已读取：

- AGENTS.md
- docs/harness/README.md
- docs/harness/project-status.md
- docs/harness/backlog.md
- docs/harness/decisions.md
- docs/harness/design-source-map.md
- docs/harness/validation-and-delivery.md
- Open Design `设计更新文档.md`
- Open Design `设计交接文档.md`
- frontend/src/App.tsx
- frontend/src/components/Sidebar.tsx
- frontend/src/components/Topbar.tsx
- frontend/src/modules/Dashboard.tsx
- frontend/src/modules/Records.tsx
- frontend/src/modules/Weight.tsx
- frontend/src/modules/Connectors.tsx
- frontend/src/modules/AIModule.tsx
- frontend/src/details/ActivityDetail.tsx
- frontend/src/login/Login.tsx
- related frontend test files

## Current Facts

- Open Design v0.1.0 页面清单包含 `index.html`、`login.html`、`register.html`、`activities.html`、`activity-detail.html`、`health.html`、`connectors.html`、`coach.html`。
- Open Design HTML 是高保真实现规格，不是生产代码源。
- 当前前端是 React/Vite 应用，主要模块包括 Dashboard、Records、Weight、Connectors、AIModule、ActivityDetail 等。
- 当前主导航骨架已对齐 `01 总览` / `02 活动` / `03 健康` / `04 连接` / `05 教练`。
- 当前 `health` view 已有 `睡眠` 骨架和复用 `WeightModule` 的 `体重` 入口。
- 当前 `App.tsx` 中仍保留 `training`、`library` 等内部 view 和模块入口，但它们不在当前主导航中。
- 当前 `frontend` 下存在 `index.html` 和 `login.html`，未发现 `register.html`。
- 当前 `design-source-map.md` 已补充逐页面状态、代码文件和测试覆盖矩阵。

## Open Questions

暂无阻塞。

后续实现注册、真实认证、AI LLM、地图路线、训练负荷参数或后端健康数据边界时，需先向用户确认。

## Steps

- [x] 重新读取本 exec plan、Open Design 文档、`decisions.md`、`design-source-map.md` 和当前前端入口文件。
- [x] 列出 Open Design 页面到 React 模块/入口的映射表。
- [x] 为每个页面标记状态：aligned / partial / missing / needs-confirmation。
- [x] 为每个页面列出主要代码文件和相关测试文件。
- [x] 为每个页面写一条后续最小切片建议。
- [x] 更新 Harness 文档保存映射结果。
- [x] 运行本计划需要的验证。
- [x] 更新 `project-status.md`、`backlog.md`，并将本 plan 移到 completed。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [x] Open Design 8 个页面均有对应映射行。
- [x] 每个映射行都有当前状态。
- [x] 每个映射行都有主要代码文件或明确 `missing` / `needs-confirmation`。
- [x] 每个映射行都有相关测试文件或明确缺口。
- [x] 文档明确映射不是规格来源；规格仍来自 Open Design + `decisions.md`。
- [x] 没有业务代码改动。

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [x] Frontend lint: N/A，仅更新 Harness 文档，未改业务代码。
- [x] Frontend tests: N/A，仅更新 Harness 文档，未改业务代码。
- [x] Frontend typecheck: N/A，仅更新 Harness 文档，未改业务代码。
- [x] Frontend build: N/A，仅更新 Harness 文档，未改业务代码。
- [x] Backend ruff: N/A，本切片不改后端代码。
- [x] Backend pytest: N/A，本切片不改后端代码。

额外检查：

- [x] `git diff --check`

## Delivery

参考 docs/harness/validation-and-delivery.md。

- 是否需要更新 project-status.md: yes，已记录页面映射矩阵建立完成。
- 是否需要更新 backlog.md: yes，已回写 P0 映射项并重新评估 Suggested next slice。
- 是否需要更新 decisions.md: no，本切片未产生新决策。
- 是否需要 commit/push: yes，按用户要求“先提交，再执行，再提交”完成第二次提交并 push。
- Backlog source item: P0 `建立 Open Design 到当前 React 模块的最小页面映射`
- Backlog update required: yes
- Completion effect: done
- Suggested next slice needs review: yes

## Resume Point

- 已完成什么：Open Design 8 个页面到当前 React 模块、入口和测试覆盖的最小映射已写入 `design-source-map.md`；project status 和 backlog 已回写。
- 下一步是什么：如果用户确认继续推进，基于 backlog 当前 Suggested next slice 创建“首页/总览入口与骨架对齐”的 active exec plan。
- 当前阻塞是什么：暂无阻塞。
