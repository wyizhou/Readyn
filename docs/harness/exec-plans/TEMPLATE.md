# Exec Plan: <任务名>

## Status

- State: draft | active | blocked | completed
- Created:
- Updated:
- Owner:
- Related design version:
- Related files:

## Goal

本次任务要完成什么。

## Scope

本次明确要做什么。

## Non-scope

本次明确不做什么，防止 AI 扩大范围。

## Inputs

本次任务必须读取的信息源，例如：

- AGENTS.md
- docs/harness/README.md
- docs/harness/project-status.md
- docs/harness/design-source-map.md
- docs/harness/decisions.md
- 相关代码文件
- 相关测试文件

## Current Facts

执行前已知事实，不写猜测。

## Open Questions

阻塞或影响架构的问题。

## Steps

用 checklist 写小步骤，每步可以更新状态。

- [ ] ...
- [ ] ...

## Acceptance Checks

Project-wide references:

- docs/harness/design-source-map.md
- docs/harness/decisions.md
- docs/harness/backlog.md

Task-specific checks:

- [ ] ...
- [ ] ...

## Verification

Baseline verification rules: see docs/harness/validation-and-delivery.md.

Required for this task:

- [ ] Frontend lint:
- [ ] Frontend tests:
- [ ] Frontend typecheck:
- [ ] Frontend build:
- [ ] Backend ruff:
- [ ] Backend pytest:

不需要的项目写 `N/A` 和原因。不要在本计划里复制所有全局验证规则，只记录本任务需要运行的验证。

## Delivery

参考 docs/harness/validation-and-delivery.md。

- 是否需要更新 project-status.md:
- 是否需要更新 backlog.md:
- 是否需要更新 decisions.md:
- 是否需要 commit/push:
- Backlog source item:
- Backlog update required: yes/no
- Completion effect: done / partial / superseded / no backlog change
- Suggested next slice needs review: yes/no

## Resume Point

如果中断，写清楚：

- 已完成什么：
- 下一步是什么：
- 当前阻塞是什么：
