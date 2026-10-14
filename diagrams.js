/* Native SVG learning diagrams. Every blue node is keyboard and touch operable. */
(() => {
  const start = (id, title, desc, height) => `<svg class="diagram-svg" viewBox="0 0 360 ${height}" role="group" aria-labelledby="${id}-title ${id}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${id}-title">${title}</title><desc id="${id}-desc">${desc}。蓝色节点可点击查看定义。</desc><defs><marker id="${id}-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="none" stroke="#839fc8" stroke-width="1.5"/></marker></defs>`;
  const node = (x, y, width, label, term, sub = "") => `<g class="node" data-term="${term}" role="button" tabindex="0" aria-label="查看 ${label} 的定义"><rect x="${x}" y="${y}" width="${width}" height="${sub ? 58 : 49}" rx="12"/><text x="${x + width / 2}" y="${y + (sub ? 25 : 30)}" text-anchor="middle">${label}</text>${sub ? `<text class="subtext" x="${x + width / 2}" y="${y + 44}" text-anchor="middle">${sub}</text>` : ""}</g>`;
  const plain = (x, y, width, label, sub = "") => `<g class="plain-node"><rect x="${x}" y="${y}" width="${width}" height="${sub ? 58 : 49}" rx="12"/><text x="${x + width / 2}" y="${y + (sub ? 25 : 30)}" text-anchor="middle">${label}</text>${sub ? `<text class="subtext" x="${x + width / 2}" y="${y + 44}" text-anchor="middle">${sub}</text>` : ""}</g>`;
  const arrow = (id, x1, y1, x2, y2) => `<path class="line" d="M${x1} ${y1} L${x2} ${y2}" marker-end="url(#${id}-arrow)"/>`;
  window.DIAGRAMS = [
    {
      id: "deal", title: "投资交易流程", subtitle: "从项目发现，到交易真正落地",
      note: "示意路径：NDA 通常先于非公开资料交换。TS 可在初步核查后、深入 DD 前形成，也可能与 DD 交错；部分机构会在 TS 前安排初步 IC 授权。图中的 IC 指结合关键尽调和拟议条款的最终投资审批。Signing 后还需满足交割条件才到 Closing；PMI 适用于并购交易。",
      svg: start("deal", "投资交易流程", "一种示意主线：Sourcing、NDA、TS、DD、最终 IC、Signing、Closing、PMI。TS 与 DD 的先后可能变化，部分机构有初步 IC 审批。", 660) +
        `<text class="muted-text" x="180" y="24" text-anchor="middle">示意主线 · 条款与尽调可能交错</text>` +
        node(36, 36, 288, "Sourcing", "sourcing", "发现与筛选机会") +
        arrow("deal", 180, 95, 180, 105) +
        node(36, 114, 288, "NDA", "nda", "交换非公开资料前签署") +
        arrow("deal", 180, 173, 180, 183) +
        node(36, 192, 288, "TS", "ts", "初步评估后明确拟议条款") +
        arrow("deal", 180, 251, 180, 261) +
        node(36, 270, 288, "DD", "dd", "深入核验并完善交易条件") +
        arrow("deal", 180, 329, 180, 339) +
        node(36, 348, 288, "IC · 最终审批", "ic", "结合关键尽调结果作决定") +
        arrow("deal", 180, 407, 180, 417) +
        node(36, 426, 288, "Signing", "signing", "签署正式协议") +
        arrow("deal", 180, 485, 180, 495) +
        node(36, 504, 288, "Closing", "closing", "满足条件并完成交割") +
        arrow("deal", 180, 563, 180, 573) +
        node(36, 582, 288, "PMI", "pmi", "并购后的业务整合") + "</svg>"
    },
    {
      id: "ev", title: "企业估值结构", subtitle: "企业价值如何桥接股权价值",
      note: "演示：股权价值 80 + 净债务 20 = 企业价值 100。真实交易还需检查少数股东权益、优先股和其他桥接项。",
      svg: start("ev", "企业价值与股权价值", "演示数据：股权价值80，加净债务20，等于企业价值100", 360) +
        `<text class="muted-text" x="18" y="26">演示数据 · 单位：百万元</text>` +
        node(32, 50, 296, "Enterprise Value = 100", "ev") +
        `<text class="strong-text" x="180" y="135" text-anchor="middle">=</text>` +
        node(32, 158, 135, "Equity = 80", "equity-value") +
        `<text class="strong-text" x="180" y="188" text-anchor="middle">+</text>` +
        node(193, 158, 135, "Net Debt = 20", "net-debt") +
        `<path class="accent-line" d="M32 238 H328"/><text class="hint-text" x="180" y="267" text-anchor="middle">购买整盘经营业务的价值</text><text class="strong-text" x="180" y="292" text-anchor="middle">≠ 股东最终可收款</text><text class="hint-text" x="180" y="317" text-anchor="middle">价格还受交割调整与合同条款影响</text></svg>`
    },
    {
      id: "returns", title: "投资回报", subtitle: "相同倍数，不同时间",
      note: "演示：投入 100，收到 200。1 年后退出为 MOIC 2.0×、IRR 100%；5 年后退出仍是 2.0×，年化 IRR 约 14.9%。",
      svg: start("returns", "IRR 与 MOIC 对比", "演示数据：投入100，1年或5年后收到200，倍数都为2倍，内部收益率不同", 360) +
        `<text class="muted-text" x="18" y="28">演示数据 · 无中途分配</text>` +
        plain(23, 53, 118, "投入 −100") +
        node(218, 53, 119, "回款 +200", "moic") +
        arrow("returns", 142, 78, 208, 78) +
        `<text class="hint-text" x="180" y="124" text-anchor="middle">情景 A：第 1 年回款</text>` +
        node(34, 145, 132, "MOIC 2.0×", "moic") +
        node(194, 145, 132, "IRR 100%", "irr") +
        `<path class="line" d="M30 234 H330"/><text class="hint-text" x="180" y="257" text-anchor="middle">情景 B：第 5 年回款</text>` +
        node(34, 274, 132, "MOIC 2.0×", "moic") +
        node(194, 274, 132, "IRR ≈14.9%", "irr") + "</svg>"
    },
    {
      id: "fund", title: "基金组织结构", subtitle: "出资、管理与底层投资",
      note: "LP 向基金缴款；GP 管理基金并按协议取得费用和业绩报酬；基金持有被投企业权益。图中箭头表示典型关系。",
      svg: start("fund", "基金组织结构", "LP向基金出资，GP管理基金，基金投资被投企业", 385) +
        node(22, 43, 130, "LP", "lp", "承诺并缴款") +
        node(208, 43, 130, "GP", "gp", "管理与决策") +
        arrow("fund", 86, 102, 147, 153) +
        arrow("fund", 273, 102, 213, 153) +
        `<text class="muted-text" x="102" y="137">出资</text><text class="muted-text" x="237" y="137">管理</text>` +
        node(85, 165, 190, "Fund", "fund", "基金载体") +
        arrow("fund", 180, 225, 180, 267) +
        `<text class="muted-text" x="194" y="256">投资</text>` +
        plain(42, 282, 276, "Portfolio Companies", "被投企业组合") +
        `<text class="hint-text" x="180" y="372" text-anchor="middle">退出回款按协议分配给 LP / GP</text></svg>`
    },
    {
      id: "dilution", title: "股权融资与稀释", subtitle: "比例变化，与公司价值变化",
      note: "演示：融资前股权价值 80，新投现金 20，融资后股权价值 100。假设无期权池和其他调整，原股东 100% → 80%，新投资人 20%。",
      svg: start("dilution", "股权融资与稀释", "演示数据：融资前80，新投资20，融资后100，原股东80%，新投资人20%", 340) +
        `<text class="muted-text" x="20" y="25">演示数据 · 纯增资，无其他调整</text><text class="strong-text" x="20" y="62">融资前估值 80</text>` +
        node(20, 78, 320, "原股东 100%", "pre-money-valuation") +
        `<text class="strong-text" x="20" y="163">新增投资 20 → 融资后估值 100</text>` +
        `<rect x="20" y="184" width="256" height="58" rx="12" fill="#3569c8"/><text x="148" y="219" fill="white" font-size="15" font-weight="700" text-anchor="middle">原股东 80%</text>` +
        node(278, 184, 62, "20%", "dilution") +
        `<text class="hint-text" x="20" y="275">原股东持股比例下降 20 个百分点</text><text class="hint-text" x="20" y="302">但其账面股权价值仍为 80</text></svg>`
    },
    {
      id: "saas", title: "SaaS 收入留存", subtitle: "存量客户如何推动经常性收入",
      note: "演示：期初 ARR 100 + 老客增购 20 − 流失 10 = 存量期末 ARR 110，NRR 为 110%。再加新客 ARR 15，总 ARR 为 125。",
      svg: start("saas", "SaaS 收入留存", "演示数据：期初ARR100，增购20，流失10，存量期末110，NRR110%，新增客户15，总ARR125", 405) +
        `<text class="muted-text" x="20" y="27">演示数据 · 金额单位相同</text>` +
        node(31, 47, 298, "期初 ARR 100", "arr") +
        node(31, 122, 142, "+ 增购 20", "expansion-revenue") +
        node(187, 122, 142, "− 流失 10", "revenue-churn") +
        node(31, 197, 298, "存量期末 ARR 110", "nrr") +
        `<text class="hint-text" x="180" y="274" text-anchor="middle">NRR = 110 ÷ 100 = 110%</text>` +
        `<path class="line" d="M40 292 H320"/><text class="hint-text" x="180" y="320" text-anchor="middle">再加新客户 ARR 15</text>` +
        node(31, 338, 298, "总 ARR 125", "arr") + "</svg>"
    }
  ];
})();
