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
│       ├── lib/              # 类型 · 空骨架(emptyData) · API 客户端 · 格式化
│       └── App.tsx           # view/detail 路由状态模型（README §5/§6）
└── backend/         # FastAPI + SQLAlchemy + SQLite（ruff + pytest）
    └── app/
        ├── models.py routers/ schemas.py services.py seed.py
        └── garmin/          # 佳明中国区集成：client(garminconnect) · transform · sync
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

> 后端不可用时前端渲染**空状态**（不再回退到假数据）；接入后端后数据来自
> `/api/bootstrap`，连接佳明并同步后填入真实数据，体重录入与资料修改会持久化。

### 数据来源 · 佳明中国区（connect.garmin.cn）

Readyn 已移除全部 mock 数据，改为对接佳明中国区真实数据（活动 / HRV / 睡眠 /
心率 / 体重，并据活动负荷推导 CTL/ATL/TSB）。集成基于 `garminconnect` 账号登录（佳明
中国区无开放 OAuth）。

```bash
cp backend/.env.example backend/.env        # 填入 GARMIN_CN_EMAIL / GARMIN_CN_PASSWORD
```

`.env` 已被 `.gitignore` 忽略，不会提交。在应用「连接器 → 数据源市场 → 佳明·中国区」
中登录即可（也可在弹窗内临时输入账号）；支持两步验证。首次登录后缓存 garminconnect
令牌，后续 `POST /api/garmin/sync` 无需密码。

> 注意：`garminconnect` 同属非官方逆向接口、未来可能失效（但相较已弃用的 `garth`
> 维护更勤、更抗封）；connect.garmin.cn 为中国区服务，需网络可达。从 garth 迁移后，
> 旧的 garth 令牌格式失效，需重新登录一次（含两步验证）重建令牌；已持久化的业务数据不丢失。

## 技术说明

- **设计令牌**：APEX 颜色/字体/间距/动效全部以 CSS 变量落地（深色主题，数字等宽）。
- **图标**：lucide-react，按用到的字形显式注册以便 tree-shaking。
- **数据契约**：`frontend/src/lib/types.ts` 与后端 §7 形状一致；空库初始化为一份
  结构完整但为空的 ApexData 骨架（`app/garmin/transform.py:empty_apexdata`，前端镜像
  `lib/emptyData.ts`），同步后由佳明真实数据填充。
- **AI 集成点**（README §10）：后端接口在未配置真实模型时返回「未配置」提示（不再
  伪造分析），接入真实服务商后替换。

## 已知遗留（后续迭代）

- 多账户登录页仍为开发态脚手架（dev-token，README §12 真实 OAuth 待接）。
- AI 洞察 / 训练计划 / 训练库 / 抱石(8a.nu) 等佳明无法提供的数据暂为空状态，待接各自
  真实来源。

## 状态

- 前端：TypeScript 严格模式、ESLint、Vitest（12 测试）、生产构建 —— 全部通过。
- 后端：ruff、pytest（25 测试）—— 全部通过。
- 已对真实佳明账号验证：登录 + MFA + 同步（活动 / HRV / 睡眠 / 心率 / 体重 /
  就绪度），令牌缓存后续同步免再验证。
