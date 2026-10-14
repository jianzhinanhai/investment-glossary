# Investment Glossary V1.1 验收记录

检查日期：2026-10-14。扩充词库后在独立 D 盘项目目录中复核。

## 内容

| 检查 | 结果 |
| --- | --- |
| 有效词条 | 180；新增 30 个常用财报、金融工具、估值、SaaS 和并购术语 |
| 分类 | 8；数量依次为 22、18、29、42、16、22、19、12 |
| 重复 ID、必填字段、关联链接 | 通过；401 条关联链接全部指向有效词条 |
| 高频概念和多义词 | VC、PE、CVC、DD、TS、GP、EV、IRR、MOIC、FCF、DPI、TVPI、ARR、NRR 等均覆盖；GP、TS 注明业务语境 |
| 关键口径 | EV/Equity Value、EBITDA/FCF、IRR/MOIC、ARR/Revenue、DPI/TVPI 均有区分与提醒 |
| 占位内容 | JSON 词库未检出 TODO、TBD、lorem、placeholder 或示例词条 |

## 功能与响应式

使用 Codex 内置浏览器对本地 HTTP 预览执行自动交互和 DOM 断言：

| 检查 | 结果 |
| --- | --- |
| 英文全称、中文和别名搜索 | 通过；复核 FVPL→FVTPL、Amortized Cost→AC、Profit and Loss→P&L、Purchase Price Allocation→PPA、其他综合收益→OCI/FVOCI，以及 IFRS、US GAAP、Operating Expenses、CAGR、TTM、YoY、TAM |
| 搜索无结果提示、分类切换 | 通过 |
| 关联术语跳转 | 通过；复核 FVOCI→OCI |
| 收藏与刷新后保留 | 通过 |
| 每次 5 个推荐、标记已掌握、刷新后保留 | 通过 |
| 6 张原生 SVG 图解展示及关键节点点击 | 通过 |
| 深浅色切换与刷新后保留 | 通过 |
| 375px、393px、1440px，三个页面横向溢出 | 均未发现 |
| 浏览器控制台致命错误 | 未发现 |
| PWA 离线 | 本地服务器停止后重新加载，仍显示 180 个词条及 6 张图解；前轮测试中收藏仍保留 |
| 主页、JSON、CSS、JS、图标、manifest、SW、来源页 | 本地 HTTP 均返回 200 |

## 本次词库补漏

新增 BS、CFS、P&L、OCI、COGS、SG&A、D&A、EPS、A/R、A/P、AC、FVOCI、FVTPL、SPPI、EIR、ECL、Impairment、IFRS、US GAAP、OpEx、Fair Value、Fair Value Hierarchy、CAGR、TTM、YoY、TAM、Deferred Revenue、PPA、Goodwill、NCI。对 AC 的多义性、债务与权益工具的 FVOCI 后续处理、P&L 与 OCI 的区别、ECL 的 12 个月口径及 PPA 的适用边界作了提醒。来源页补充 IFRS Foundation 的 IFRS 9、13、3、15 参考。

375px、393px 与 1440px 视口复查均未发现横向溢出；浏览器错误日志为空。学习推荐仍为 5 个，收藏、已掌握进度和深色模式刷新后保留。

## 验证边界

- 375px 与 393px 为浏览器视口模拟；没有在真实 iPhone Safari 或 Android Chrome 设备上运行。
- 自动化脚本所需的独立 Playwright 浏览器下载未能在本次环境完成；上述交互由 Codex 内置浏览器自动化完成。
- 浏览器禁用本地存储时的降级分支经过代码审查，未在该特殊配置下进行实机测试。
- GitHub Pages 的公开可访问性与线上资源状态在部署后单独核验，结果见交付报告。

## 交易流程图修订复核

- 将原图中 NDA / DD、TS / IC 的并排布局改为单列示意主线：Sourcing → NDA → TS → DD → 最终 IC → Signing → Closing → PMI。
- 图下注明 TS 与 DD 可交错、部分机构在 TS 前安排初步 IC 授权，以及 PMI 主要适用于并购。参考来源页补充 British Business Bank 对 TS、DD 和 IC 的说明。
- 本地浏览器 375px 视口检查：8 个流程节点全部展示，无横向溢出；点击最终 IC 可打开对应词条。图解总数仍为 6。
- 加入公开站点分享入口和链接预览元信息；分享指向固定的 GitHub Pages 地址。真实手机分享面板与第三方平台预览未进行设备实测。
