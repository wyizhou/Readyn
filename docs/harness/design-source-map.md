# 设计源映射

## Open Design 核心文档

Open Design 项目路径：

```text
C:\Users\e_\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\2194d51e-2395-4af4-adf9-5a624f6d1368
```

核心文档：

- `设计更新文档.md`：记录设计版本、更新时间、影响范围、开发重点。
- `设计交接文档.md`：记录页面结构、组件、视觉规范、数据边界、Coding 注意事项、验收标准和未解决问题。

## 设计页面清单

Open Design 当前定义的页面：

- `index.html`：负荷总览，产品入口。
- `login.html`：登录。
- `register.html`：注册。
- `activities.html`：活动记录。
- `activity-detail.html`：运动详情。
- `health.html`：健康，包含睡眠和体重。
- `connectors.html`：Garmin 连接。
- `coach.html`：AI 教练。

配套资源：

- `css/trainalyze-design.css`
- `css/trainalyze-detail.css`
- `js/trainalyze-design.js`
- `trainalyze-takeover.md`

## 设计到 React 的映射方式

Open Design HTML 是高保真实现规格，不是生产代码源。实现时应拆成真实 React 页面、组件、状态和数据结构。

建议映射方向：

- `index.html` -> 负荷总览模块，替代/改造当前 Dashboard 入口。
- `activities.html` -> 活动记录模块，改造当前 Records。
- `activity-detail.html` -> 活动详情模块，改造当前 ActivityDetail。
- `health.html` -> 健康模块；当前 Weight 只覆盖部分体重能力，需要补睡眠/健康二级菜单。
- `connectors.html` -> 连接器模块，复用当前 Garmin 连接与同步能力。
- `coach.html` -> AI 教练模块，复用当前 AI fallback 和后端未配置提示。
- `login.html` / `register.html` -> 认证页面；当前前端已有 login 入口，但需按设计确认注册和中文校验流。

组件映射重点：

- Sidebar：主导航固定为 `01 总览`、`02 活动`、`03 健康`、`04 连接`、`05 教练`。
- Health Submenu：健康是唯一二级菜单，只包含睡眠、体重。
- Filter Select：活动运动类型筛选必须由活动数据去重生成。
- Chart Card / Detail Chart Tabs：有数据展示图表，无数据展示灰色空态和缺失原因。
- Connector Card：Garmin 中国 / International 登录、2FA、同步状态、错误路径。
- Empty State：无真实数据时不伪造。

## 当前页面映射矩阵

状态说明：

- `aligned`：当前实现已覆盖该设计页面的骨架和主要行为。
- `partial`：已有可复用入口或模块，但还未完整对齐 Open Design。
- `missing`：当前没有对应入口或实现。
- `needs-confirmation`：映射或产品边界需要用户确认后再实现。

| Open Design 页面 | 当前 React / 入口 | 状态 | 相关测试 | 后续最小切片 |
| --- | --- | --- | --- | --- |
| `index.html` 负荷总览 | `frontend/index.html`、`frontend/src/App.tsx`、`frontend/src/modules/Dashboard.tsx` | `partial` | `frontend/src/App.test.tsx`、`frontend/src/modules/Dashboard.test.tsx` | 确认首页就是负荷总览，并逐步对齐指标卡、趋势图、来源证据、公式说明和下一次训练建议。 |
| `login.html` 登录 | `frontend/login.html`、`frontend/src/login/Login.tsx`、`frontend/src/login/main.tsx` | `partial` | 当前未发现专门 login 测试 | 当前是账户选择式登录；后续需按 Open Design 确认中文登录表单、校验、响应式和真实认证边界。 |
| `register.html` 注册 | 当前未发现 `frontend/register.html` 或注册 React 入口 | `missing` | 当前未发现注册测试 | 创建前需确认注册策略、字段、校验和后端认证/会话边界。 |
| `activities.html` 活动记录 | `frontend/src/App.tsx`、`frontend/src/modules/Records.tsx` | `partial` | `frontend/src/App.test.tsx`、`frontend/src/modules/Records.test.tsx` | 在保留现有列表/分页/详情入口基础上，对齐搜索、运动类型去重筛选、表格字段和键盘访问。 |
| `activity-detail.html` 运动详情 | `frontend/src/details/ActivityDetail.tsx` | `partial` | `frontend/src/details/ActivityDetail.test.tsx` | 对齐 Open Design 的高密度详情结构；涉及路线、原始流和缺失数据时保持空态，不伪造数据。 |
| `health.html` 健康 | `frontend/src/App.tsx`、`frontend/src/modules/Weight.tsx` | `partial` | `frontend/src/App.test.tsx` | 健康二级菜单已限制为睡眠/体重；后续补齐睡眠页、体重页和 hash 定位规则。 |
| `connectors.html` Garmin 连接 | `frontend/src/modules/Connectors.tsx`、`frontend/src/details/ConnectorDetail.tsx` | `partial` | `frontend/src/modules/Connectors.test.tsx`、`frontend/src/details/ConnectorDetail.test.tsx`、`frontend/src/App.disconnect.test.tsx` | 对齐 Garmin 中国 / International、登录、2FA、同步进度、错误路径和空态文案。 |
| `coach.html` AI 教练 | `frontend/src/modules/AIModule.tsx` | `partial` | `frontend/src/modules/AIModule.test.tsx`、`frontend/src/App.test.tsx` | 对齐教练页的对话、输入、复制、来源证据和公式输入说明；真实 LLM 接入仍需确认。 |

## 设计到后端的映射方式

后端已存在的基础能力：

- bootstrap 完整空数据结构。
- profile、weight、settings、dashboard、training、library、connectors 等 API。
- Garmin 连接、MFA、token、同步和错误处理。
- Garmin 活动、睡眠、体重、HRV 等转换能力。
- HR-TRIMP、功率 TSS、sRPE、负荷来源映射。

仍需确认或补齐的后端边界：

- 认证和会话策略。
- 设计要求中的完整健康页数据接口形态。
- ATL/CTL/TSB/A:C/Easy TRIMP 的产品参数、窗口、阈值和风险区间。
- AI 教练是否接真实 LLM、是否保存对话历史、是否强制来源引用。
- 地图路线服务选择。

## 不原样复制 HTML 原则

- 不把 Open Design HTML 当作最终生产代码。
- 不恢复旧入口卡片页或 `dashboard.html`。
- 不为匹配静态设计而制造不存在的数据。
- 视觉 token、布局密度、交互结构可以参考设计，但实现应使用项目已有 React、TypeScript、API 和测试体系。
