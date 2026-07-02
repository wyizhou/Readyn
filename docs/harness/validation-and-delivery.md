# 验证与交付

本文件记录 Trainalyze 的验证入口和交付规则。

## 前端验证

工作目录：`frontend`

```powershell
npm run lint
npm run test:run
npm run typecheck
npm run build
```

用途：

- `lint`：检查 ESLint 规则。
- `test:run`：运行 Vitest 测试。
- `typecheck`：运行 TypeScript 项目检查。
- `build`：确认生产构建可通过。

## 后端验证

工作目录：`backend`

```powershell
.\.venv\Scripts\python.exe -m ruff check .
.\.venv\Scripts\python.exe -m pytest
```

用途：

- `ruff`：检查 Python lint/import/现代化规则。
- `pytest`：运行 API、Garmin、负荷计算等后端测试。

优先使用仓库内 `backend/.venv`，避免误用系统 Python。若本地虚拟环境不存在，需要先创建/安装依赖，或向用户确认可用的 Python 环境。

## 什么时候跑哪些验证

- 前端页面、组件、样式、交互变更：至少跑前端 `lint`、`test:run`、`typecheck`；交付前跑 `build`。
- 后端 API、Garmin、算法、数据结构变更：至少跑后端 `ruff`、`pytest`。
- 前后端契约同时变化：前端和后端验证都需要跑。
- 文档-only 变更：无需跑产品 lint/test，除非文档变更伴随代码或配置改动。
- 只读分析：不需要验证命令。

## Git / GitHub 交付

根据 `AGENTS.md`：

- 每次完成一个产品功能后，应本地 git commit。
- 每次完成一个产品功能后，应 push 到 GitHub 仓库。
- 提交前应说明验证结果。

例外：

- 用户明确要求不要提交时，不提交。
- 只读分析不需要 commit/push。
- 仅创建或更新 Harness 文档时，是否提交按用户当次要求执行。
