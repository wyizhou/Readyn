1. 不要猜测用户意图，必要时向用户提问完善信息，才继续执行。
2. 每次功能/代码交付都需要使用 lint 和 testing 进行测试。
3. 设计稿来源为本地 Open Design 输出目录；每次我说设计稿更新的时候，你应该主动刷新/读取新的 Open Design 输出并开始功能开发、更新以及迭代。
4. 每次完成一个功能的时候，应当提交本地 git，并且 push 到 GitHub 仓库。

## Trainalyze Harness 地图

Harness 文档位于 `docs/harness/`。开始任务前先读 `docs/harness/README.md`，再按任务类型按需加载：

- 设计相关任务：读 `docs/harness/design-source-map.md` 和 `docs/harness/decisions.md`。
- 状态/计划相关任务：读 `docs/harness/project-status.md` 和 `docs/harness/backlog.md`。
- 验证/交付相关任务：读 `docs/harness/validation-and-delivery.md`。
- 如果发现信息冲突：先查 `docs/harness/decisions.md`，再向用户确认。

AGENTS.md 只作为地图和硬规则，不复制设计交接文档、backlog 全文或测试说明。
