# Backlog

本文件是待办池，只记录当前可执行待办和优先级建议，不是规格来源。需求来源以 Open Design 和 `decisions.md` 为准。

状态标记：

- `[ ]` not started
- `[~]` in progress
- `[x]` done

Active exec plan 应关联对应 backlog 项；completed exec plan 应回写对应 backlog 项。

## P0：必须先处理，否则影响主流程

- [x] 建立 Open Design 到当前 React 模块的最小页面映射，确认哪些现有模块保留、改名、合并或替换。
- [x] 对齐主导航为 `01 总览`、`02 活动`、`03 健康`、`04 连接`、`05 教练`，并移除与最新设计冲突的旧导航结构。
- [x] 确认首页为负荷总览，不恢复入口卡片页或 `dashboard.html`。
- [x] 明确健康页最小范围：只做睡眠和体重二级菜单，不扩展 HRV、静息心率等未确认页面。
- [x] 保持无连接/无数据状态诚实展示，避免为设计效果制造数据。

## P1：主流程重要但可分步做

- [~] 将当前 Dashboard 调整为 Open Design 的负荷总览结构，包括指标卡、趋势图、来源证据、公式说明、下一次训练建议。（已完成结构标识切片；完整内容和视觉对齐仍保留。）
- 将当前 Records 调整为活动记录页：搜索、运动类型去重下拉筛选、活动表格、行点击/键盘访问。
- 将 ActivityDetail 调整为设计要求的高密度详情结构：总览、分圈、心率、配速、功率、路线海拔、跑姿动态、杂项、原始字段。
- 将健康页补齐睡眠/体重切换和 hash 定位规则。
- 将 Connectors 对齐 Garmin 中国 / International、登录、2FA、同步进度、错误路径。
- 将 AI 模块对齐教练页：对话、输入、复制、来源证据和公式输入说明。
- 补齐登录/注册中文校验和响应式布局。

## P2：增强或后续完善

- 补充 ATL/CTL/TSB/A:C/Easy TRIMP 参数配置和 UI 风险区间。
- 明确并实现地图路线服务。
- 明确并实现 AI 真实 LLM 接入、来源引用和对话历史策略。
- 扩展多运动类型字段优先级规则，例如攀岩、力量、骑行、游泳的详情展示差异。
- 增加导出、分享、批量编辑等能力，前提是产品需求确认。
- 将 Harness 扩展为更细的 `frontend-map.md`、`backend-map.md`、`open-questions.md`。

## Suggested next slice (temporary)

- Last reviewed: 2026-07-02
- Status: tentative

暂定：继续拆分 Dashboard 负荷总览内容对齐，下一步只选择一个具体可验证差异，例如指标卡字段/说明或趋势来源/公式呈现。

这是临时建议，不是长期决策。执行前必须创建 exec plan，并重新核对 Open Design、`decisions.md` 和当前代码。

需求来源不是 backlog，而是 Open Design + `decisions.md`；backlog 只提供优先级和切片建议。

简要原因：

- P0 主流程骨架与空态审计已完成。
- 总览页结构标识切片已完成，但 Dashboard 仍是 `partial`。
- 下一个可执行方向仍在 P1：继续对齐总览页内容结构。
- 范围仍应拆小，只处理一个总览页结构切片，不做完整页面重写。

建议范围：

- 只处理 Dashboard 中一个可验证的 Open Design 总览结构差异。
- 不重写完整 Dashboard。
- 不接入新后端能力。
