# 项目状态快照

更新时间：2026-07-02  
状态来源：`AGENTS.md`、Open Design 文档、当前 `frontend/src`、`backend/app`、测试结构。

## 当前设计版本

- Open Design 版本：`v0.1.0`
- 最近设计更新时间：`2026-07-01 17:34`
- 设计状态：Trainalyze Web 第一版高保真设计已完成，可进入 Coding 实现阶段。

## Open Design 路径

```text
C:\Users\e_\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\2194d51e-2395-4af4-adf9-5a624f6d1368
```

核心文档：

- `设计更新文档.md`
- `设计交接文档.md`

## 当前技术栈

前端：

- React `19.2.x`
- TypeScript `~6.0`
- Vite `8.x`
- Vitest
- ESLint
- Testing Library
- `lucide-react`

后端：

- Python `>=3.11`
- FastAPI
- SQLAlchemy
- Pydantic v2
- pytest
- ruff
- Garmin 集成：`garminconnect==0.3.6`、`curl_cffi==0.15.0`

## 当前实现状态摘要

前端当前是已有 React/Vite 应用，包含 Dashboard、Records、Training、Library、Weight、Connectors、AI、Settings、ActivityDetail 等模块和较完整测试。它已有数据空态、连接器、活动详情、AI fallback 等能力。主导航骨架已对齐 Open Design v0.1.0 的 `01 总览 / 02 活动 / 03 健康 / 04 连接 / 05 教练`，健康已作为唯一二级菜单并包含睡眠/体重入口；完整页面内容仍需后续切片继续对齐 Open Design。

后端当前是 FastAPI 应用，已包含 profile/data/garmin/ai/settings/system 路由。测试确认 bootstrap 在 Garmin 同步前保持完整但空的数据结构；Garmin 同步、MFA、token、数据转换、训练负荷归一化等已有后端支持。

当前需要把 Open Design 的最新页面结构和设计语言映射到真实 React 组件，而不是把 Open Design HTML 直接复制进生产代码。

Open Design 到当前 React 入口的最小页面映射已建立在 `design-source-map.md`。当前 8 个设计页面中，`register.html` 暂无实现入口，其余页面均有可复用入口或模块但整体仍为 `partial`，后续应按单个切片逐步对齐。

首页 / `index.html` 已确认对应当前 `dashboard` 总览入口。总览页最小骨架已覆盖负荷指标、体能趋势、来源证据、公式说明和下一次训练建议空态；当前仍不是完整 Open Design 视觉重写。

## 当前验证入口

前端工作目录：`frontend`

- `npm run lint`
- `npm run test:run`
- `npm run typecheck`
- `npm run build`

后端工作目录：`backend`

- `.\.venv\Scripts\python.exe -m ruff check .`
- `.\.venv\Scripts\python.exe -m pytest`

详细规则见 `validation-and-delivery.md`。

## Git / GitHub 交付规则

根据 `AGENTS.md`，每次完成一个功能后应本地 git commit 并 push 到 GitHub。  
如果任务只是只读分析，不需要 commit/push。
