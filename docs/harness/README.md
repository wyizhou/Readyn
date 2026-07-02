# Trainalyze Harness

本目录是 Trainalyze 的项目 Harness 知识库。它的目标是保存项目状态、设计映射、已确认决策、待办、验证和交付规则，让后续 Codex 可以按任务按需加载，而不是每次把所有上下文读完。

`AGENTS.md` 后续应保持为地图：只保留核心行为规则，并指向本目录。详细事实、状态和计划放在这里维护。

## 使用方式

开始任何任务前，先读本文件，再按任务类型读取相关文件：

- 状态梳理、接手项目：读 `project-status.md`、`decisions.md`。
- 设计实现或设计更新：读 `design-source-map.md`、`decisions.md`、`backlog.md`。
- 计划拆分或排优先级：读 `backlog.md`、`project-status.md`。`backlog.md` 是待办池，不是规格来源。
- 可追踪功能执行：读 `exec-plans/TEMPLATE.md`，并在 `exec-plans/active/` 创建任务计划。
- 验证、交付、收尾：读 `validation-and-delivery.md`。
- 遇到设计/代码冲突：先查 `decisions.md`，再回到 Open Design 原文确认。

## Exec Plan

Exec plan 用于让较大的功能开发可控、可追踪、可恢复。模板位于 `exec-plans/TEMPLATE.md`。

需要创建 exec plan 的情况：

- 跨多个文件。
- 影响主流程。
- 需要多轮实现。
- 用户要求可追踪计划。

通常不需要创建 exec plan 的情况：

- 小 typo。
- 只读分析。
- 单个简单 bug 修复。

使用规则：

- 新计划从 `exec-plans/TEMPLATE.md` 复制到 `exec-plans/active/`，文件名使用简短任务名。
- 具体正在执行的任务以 `exec-plans/active/` 中的计划为准。
- 计划执行中持续更新 `Status`、`Steps`、`Open Questions` 和 `Resume Point`。
- 完成后把计划移到 `exec-plans/completed/`，并在需要时同步更新 `project-status.md`、`backlog.md` 或 `decisions.md`。
- Exec plan 不替代用户确认；如果计划中出现阻塞或架构影响问题，先向用户确认。

## 文档边界

- 本目录记录项目事实和工作规则，不保存完整 Open Design 文档副本。
- Open Design 是设计规格源；本目录只保存与实现相关的摘要、映射和决策。
- 当前业务代码事实以 `frontend/src`、`backend/app` 和测试为准。
- 如果本目录与 Open Design 或代码冲突，需要更新 Harness 或明确记录新的决策。

## 当前第一批文档

- `project-status.md`：当前设计版本、技术栈、实现状态、验证入口。
- `design-source-map.md`：Open Design 来源、页面清单、设计到 React/后端的映射方式。
- `decisions.md`：已确认且后续应遵守的产品/实现决策。
- `backlog.md`：按 P0/P1/P2 管理的待办池；不是规格来源。
- `validation-and-delivery.md`：lint/test/typecheck/build、commit/push 与只读分析规则。
- `exec-plans/TEMPLATE.md`：多文件、多轮或主流程变更的执行计划模板。
