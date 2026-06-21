# Readyn · 运动数据分析平台

面向个人 **耐力 + 攀岩** 运动员的训练数据分析平台。连接器统一接入多源数据 →
看板综合分析 → 训练模块闭环 → AI 贯穿全局。主要运动项目：跑步、登山、徒步、抱石、难度。

本仓库是高保真设计稿的生产化实现（Vite + React + TypeScript 前端 + FastAPI 后端），
1:1 对齐设计稿的每个页面、详情页与交互，并配套真实后端 API 与持久化。

> 设计稿来源：claude.ai design 项目 `0260f084-fa7f-41d7-921d-fa86ce82228f`，
> 设计系统为 **APEX Design System**。完整交接说明见设计项目内 `README.md`（§1–13）。

## 架构

```
Readyn/
├── frontend/        # Vite 8 + React 19 + TypeScript（ESLint + Vitest）
│   └── src/
│       ├── design-system/   # APEX 设计系统 13 个组件（类型化端口）
│       ├── components/       # Icon · Sidebar · Topbar · charts · spec 批注层
│       ├── modules/          # 看板/训练日历/训练库/体重/连接器/AI/设置/资料
│       ├── details/          # 活动/指标/模板/计划/连接器 详情页
│       ├── login/            # 独立登录页（第二个 Vite 入口）
│       ├── lib/              # 类型 · mock 数据 · API 客户端 · 格式化
│       └── App.tsx           # view/detail 路由状态模型（README §5/§6）
└── backend/         # FastAPI + SQLAlchemy + SQLite（ruff + pytest）
    └── app/
        ├── models.py routers/ schemas.py services.py seed.py
        └── seed_data.json    # 从前端 mockData 生成，前后端同源同形
```

五大模块 + 支撑层：看板 (Dashboard)、训练日历 (Training)、训练库 (Library)、
体重记录 (Weight)、连接器 (Connectors)、AI 模块、个人资料 / 设置中心，
以及「实现批注」层与多账户登录页。

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173（开发时将 /api 代理到后端）
```

脚本：`npm run lint` · `npm run typecheck` · `npm run test:run` · `npm run build`

### 后端

```bash
cd backend
python -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"   # Windows（其他平台见 backend/README.md）
.venv/Scripts/uvicorn app.main:app --reload        # http://127.0.0.1:8000 · 文档 /docs
```

脚本：`.venv/Scripts/python -m pytest` · `.venv/Scripts/python -m ruff check .`

> 前端在后端不可用时自动回退到本地 mock 数据，因此可独立运行；接入后端后
> 数据来自 `/api/bootstrap`，体重录入与资料修改会持久化。

## 技术说明

- **设计令牌**：APEX 颜色/字体/间距/动效全部以 CSS 变量落地（深色主题，数字等宽）。
- **图标**：lucide-react，按用到的字形显式注册以便 tree-shaking。
- **数据契约**：`frontend/src/lib/types.ts` 与后端 §7 形状一致；seed 数据由前端
  mockData 经 esbuild 生成，保证前后端同源。
- **AI 集成点**（README §10）：后端 4 处接口目前返回预置文案，接入真实模型后替换。

## 状态

- 前端：TypeScript 严格模式、ESLint、Vitest（13 测试）、生产构建 —— 全部通过。
- 后端：ruff、pytest（13 测试）—— 全部通过。
