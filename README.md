# Investment Glossary｜投资术语交互式知识库

一个无后端、无账号的投资知识手册：150 个术语、8 个分类、6 张可交互 SVG 图解。使用原生 HTML、CSS 和 JavaScript，可部署在 GitHub Pages 子路径下。

## 使用

在线地址：<https://jianzhinanhai.github.io/investment-glossary/>

- 搜索缩写、英文全称、中文解释或别名；可按分类筛选。
- 点击卡片阅读投资实务价值、通俗理解、口径提醒和关联术语。
- 收藏和“已掌握”进度保存在当前浏览器；无需登录。
- “学流程”页提供 5 个学习推荐和 6 张可点击的 SVG 图解。
- 默认跟随系统外观，也可切换浅色或深色。
- 首次完整联网加载后，Service Worker 缓存核心资源供离线查阅。

## 本地预览

```powershell
python tools/preview_server.py 8765
```

打开 `http://127.0.0.1:8765/`。请使用 HTTP 预览；直接打开 `file:` 页面无法正常使用 Service Worker。

## 维护词库

编辑 `content/terms.psv`，然后运行：

```powershell
python tools/build_data.py
```

脚本校验 8 个分类的精确数量、150 个唯一词条 ID、六项必填内容以及关联术语链接，再生成独立的 `data/glossary.json`。增补词条时应同步调整脚本中的分类数量与总数约束。发布任何资源或词库修订时，请提升 `sw.js` 中的缓存版本，使旧缓存被清理。

## 质量检查

```powershell
python -c "import runpy; print(runpy.run_path('tests/run_qa.py')['content_checks']())"
```

`tests/run_qa.py` 还提供 Chromium、WebKit 的可重复浏览器测试，浏览器需安装在项目内的 `.playwright-browsers` 目录。当前发布的实际验收结果与设备边界见 [QA_REPORT.md](./QA_REPORT.md)。

## 口径

参考 [ILPA Private Equity Glossary](https://ilpa.org/resources-tools/private-equity-101/private-equity-glossary/)、[CFA Institute 估值教材](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/market-based-valuation-price-enterprise-value-multiples)、[CFA Institute 自由现金流教材](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/free-cash-flow-valuation)与 [SEC 披露示例](https://www.sec.gov/Archives/edgar/data/1831840/000162828024041725/final_analystdayxpresent.htm)。站内 [定义口径与参考来源](./sources.html) 说明常见口径差异。本项目用于学习，不构成投资建议。
