# Exec Plan: 主导航和健康二级菜单骨架对齐

## Status

- State: active
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

实现前应重新核对上述文件，尤其是 Open Design 设计源、`decisions.md` 和当前代码。

## Current Facts

- Open Design v0.1.0 要求主导航固定为 `01 总览`、`02 活动`、`03 健康`、`04 连接`、`05 教练`。
- Open Design v0.1.0 要求健康是唯一二级菜单，且当前只包含 `睡眠`、`体重`。
- `frontend/src/components/Sidebar.tsx` 当前 `ViewId` 为 `dashboard | records | training | library | weight | connectors | ai`。
- `frontend/src/components/Sidebar.tsx` 当前主导航实际渲染 5 项：`看板`、`运动记录`、`体重记录`、`连接器`、`AI 模块`。
- 当前 `Sidebar.tsx` 没有 `健康` 主导航项，也没有 `睡眠` / `体重` 二级菜单。
- `frontend/src/App.tsx` 当前默认 view 是 `dashboard`，并在 `titles` 中使用 `看板`、`运动记录`、`训练日历`、`训练库`、`体重记录`、`连接器`、`AI 模块`。
- `frontend/src/App.tsx` 当前 `weight` view 渲染 `WeightModule`，没有独立 health view。
- `frontend/src/components/Topbar.tsx` 只展示上层传入的 `title` / `subtitle` / `right` / `onBack`，不自己定义导航结构。
- `frontend/src/App.test.tsx` 当前导航测试使用旧文案：`看板`、`运动记录`、`体重记录`、`连接器`、`AI 模块`，并断言 `训练日历` / `训练库` 不在导航中。

## Open Questions

暂无阻塞。

实现时若发现需要决定 URL/hash、健康默认子页、或旧 `weight` view 是否保留兼容入口，应先向用户确认。

## Steps

- [ ] 重新读取本 exec plan、Open Design 映射、`decisions.md` 和当前导航相关代码。
- [ ] 确认最小可行的 view/state 命名方案，不扩大到完整页面重构。
- [ ] 调整主导航文案和顺序为 `01 总览` / `02 活动` / `03 健康` / `04 连接` / `05 教练`。
- [ ] 为健康增加唯一二级菜单骨架：`睡眠` / `体重`。
- [ ] 对齐相关页面入口或 Topbar 标题骨架。
- [ ] 更新导航相关测试，覆盖主导航顺序、健康二级菜单和切换行为。
- [ ] 运行本计划列出的前端验证。
- [ ] 根据结果更新 Harness 文档和交付状态。

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [ ] 主导航只呈现设计要求的 5 个主项，顺序为 `01 总览` / `02 活动` / `03 健康` / `04 连接` / `05 教练`。
- [ ] 健康是唯一二级菜单。
- [ ] 健康二级菜单只包含 `睡眠` / `体重`。
- [ ] 点击主导航能进入对应页面骨架或现有模块映射入口。
- [ ] 健康二级菜单切换能展示对应标题或入口骨架。
- [ ] 旧导航文案 `看板`、`运动记录`、`体重记录`、`连接器`、`AI 模块` 不再作为主导航标签出现，除非明确作为非导航内容保留。
- [ ] 不改后端 API、训练负荷算法、真实认证、AI LLM 接入。
- [ ] 相关前端测试覆盖导航顺序和健康二级菜单。

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [ ] Frontend lint: `npm run lint`
- [ ] Frontend tests: `npm run test:run`
- [ ] Frontend typecheck: `npm run typecheck`
- [ ] Frontend build: `npm run build`
- [ ] Backend ruff: N/A，本切片不改后端代码。
- [ ] Backend pytest: N/A，本切片不改后端代码。

不要在本计划里复制所有全局验证规则；执行时以 `validation-and-delivery.md` 为准。

## Delivery

参考 docs/harness/validation-and-delivery.md。

- 是否需要更新 project-status.md: 实现完成后需要，记录导航骨架已对齐的状态。
- 是否需要更新 backlog.md: 实现完成后需要，调整 P0/Suggested next slice 状态。
- 是否需要更新 decisions.md: 默认不需要；只有产生新确认决策时才更新。
- 是否需要 commit/push: 需要。完成产品功能后按 AGENTS.md 本地 commit 并 push GitHub。

## Resume Point

- 已完成什么：已创建 active exec plan；已读取 Harness 文档、导航相关代码和导航相关测试。
- 下一步是什么：等待用户确认计划后，才开始实现主导航和健康二级菜单骨架。
- 当前阻塞是什么：暂无阻塞；实现尚未开始。
