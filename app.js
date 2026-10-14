(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const state = {
    data: null, byId: new Map(), category: "all", view: "discover",
    favorites: new Set(), mastered: new Set(), recommendations: [],
    storageOK: true, currentTerm: null, lastFocus: null, installPrompt: null
  };
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const normalized = (value) => String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
  const toast = (message) => {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 3500);
  };
  const storage = {
    get(key) {
      try { return localStorage.getItem(key); }
      catch { state.storageOK = false; return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); return true; }
      catch { state.storageOK = false; toast("浏览器无法保存本地进度；本次会话仍可使用。"); return false; }
    }
  };
  const readSet = (key) => {
    try {
      const value = JSON.parse(storage.get(key) || "[]");
      return new Set(Array.isArray(value) ? value.filter((id) => state.byId.has(id)) : []);
    } catch { return new Set(); }
  };
  const persist = (key, set) => storage.set(key, JSON.stringify([...set]));
  const categoryName = (id) => state.data.categories.find((item) => item.id === id)?.name || "";
  const matches = (term, query) => {
    const q = normalized(query);
    if (!q) return true;
    return normalized([term.term, term.fullName, term.zh, term.practical, term.plain, ...(term.aliases || [])].join(" ")).includes(q);
  };
  const card = (term) => `
    <article class="term-card">
      <button type="button" class="card-main" data-open="${esc(term.id)}" aria-label="查看 ${esc(term.term)}：${esc(term.zh)}">
        <span class="card-top"><span class="category-tag">${esc(categoryName(term.category))}</span><span class="card-arrow" aria-hidden="true">↗</span></span>
        <h3>${esc(term.term)}</h3>
        <p class="card-zh">${esc(term.zh)}</p>
        <p class="card-plain">${esc(term.plain)}</p>
      </button>
      <div class="card-footer"><span>${term.fullName !== term.term ? esc(term.fullName) : "查看完整解释"}</span>
        <button type="button" class="bookmark" data-favorite="${esc(term.id)}" aria-label="${state.favorites.has(term.id) ? "取消收藏" : "收藏"} ${esc(term.term)}" aria-pressed="${state.favorites.has(term.id)}">${state.favorites.has(term.id) ? "♥" : "♡"}</button>
      </div>
    </article>`;
  const renderChips = () => {
    $("#category-chips").innerHTML = `<button type="button" class="chip" data-category="all" aria-pressed="${state.category === "all"}">全部术语 · ${state.data.terms.length}</button>` +
      state.data.categories.map((item) => `<button type="button" class="chip" data-category="${esc(item.id)}" aria-pressed="${state.category === item.id}">${esc(item.name)} · ${item.count}</button>`).join("");
  };
  const renderDiscover = () => {
    const query = $("#search-input").value;
    const found = state.data.terms.filter((term) => (state.category === "all" || term.category === state.category) && matches(term, query));
    $("#result-count").textContent = `找到 ${found.length} 个术语`;
    $("#term-grid").innerHTML = found.map(card).join("");
    $("#empty-state").hidden = found.length > 0;
    renderChips();
  };
  const renderSaved = () => {
    const query = $("#saved-search-input").value;
    const saved = state.data.terms.filter((term) => state.favorites.has(term.id) && matches(term, query));
    $("#saved-count").textContent = `已收藏 ${state.favorites.size} 个 · 当前显示 ${saved.length} 个`;
    $("#saved-grid").innerHTML = saved.map(card).join("");
    $("#saved-empty").hidden = saved.length > 0;
    $("#saved-empty h3").textContent = state.favorites.size ? "没有匹配的收藏" : "收藏夹还是空的";
  };
  const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const refreshRecommendations = () => {
    const unseen = shuffle(state.data.terms.filter((term) => !state.mastered.has(term.id)));
    const seen = shuffle(state.data.terms.filter((term) => state.mastered.has(term.id)));
    state.recommendations = [...unseen, ...seen].slice(0, 5).map((term) => term.id);
    renderLearning();
  };
  const renderLearning = () => {
    const total = state.data.terms.length;
    $("#progress-copy").textContent = `已掌握 ${state.mastered.size} / ${total} 个术语`;
    $(".progress-track").setAttribute("aria-valuemax", String(total));
    $(".progress-track").setAttribute("aria-valuenow", String(state.mastered.size));
    $("#progress-fill").style.width = `${state.mastered.size / total * 100}%`;
    $("#recommendations").innerHTML = state.recommendations.map((id) => {
      const term = state.byId.get(id);
      return `<button type="button" class="recommendation" data-open="${esc(id)}"><strong>${esc(term.term)}</strong><span>${esc(term.zh)}</span></button>`;
    }).join("");
  };
  const renderDiagrams = () => {
    $("#diagram-grid").innerHTML = window.DIAGRAMS.map((item, index) => `
      <figure class="diagram-card">
        <figcaption class="diagram-head"><span class="diagram-number">${String(index + 1).padStart(2, "0")}</span><span><h3>${esc(item.title)}</h3><p>${esc(item.subtitle)}</p></span></figcaption>
        ${item.svg}<p class="diagram-note">${esc(item.note)}</p>
      </figure>`).join("");
  };
  const openTerm = (id) => {
    const term = state.byId.get(id);
    if (!term) return;
    const dialog = $("#term-dialog");
    if (!dialog.open) state.lastFocus = document.activeElement;
    state.currentTerm = id;
    $("#dialog-category").textContent = categoryName(term.category);
    $("#dialog-body").innerHTML = `
      <h2 id="dialog-term" class="dialog-title">${esc(term.term)}</h2>
      ${term.fullName !== term.term ? `<p class="dialog-full">${esc(term.fullName)}</p>` : ""}
      <div class="dialog-zh">${esc(term.zh)}</div>
      <section class="detail-section"><h3>投资实务价值</h3><p>${esc(term.practical)}</p></section>
      <section class="detail-section"><h3>通俗理解</h3><p>${esc(term.plain)}</p></section>
      ${term.note ? `<section class="detail-section detail-note"><h3>公式与口径提醒</h3><p>${esc(term.note)}</p></section>` : ""}
      <section class="detail-section"><h3>关联术语</h3><div class="related-list">${term.related.map((ref) => `<button type="button" data-open="${esc(ref)}">${esc(state.byId.get(ref).term)} ↗</button>`).join("")}</div></section>
      <div class="detail-actions">
        <button type="button" class="action-button ${state.favorites.has(id) ? "active" : ""}" data-favorite="${esc(id)}" aria-pressed="${state.favorites.has(id)}">${state.favorites.has(id) ? "♥ 已收藏" : "♡ 收藏"}</button>
        <button type="button" class="action-button ${state.mastered.has(id) ? "active" : ""}" data-mastered="${esc(id)}" aria-pressed="${state.mastered.has(id)}">${state.mastered.has(id) ? "✓ 已掌握" : "✓ 标记已掌握"}</button>
      </div>`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    $("#dialog-close").focus();
  };
  const setView = (view) => {
    if (!["discover", "learn", "saved"].includes(view)) return;
    if (!state.data && view !== "discover") return;
    state.view = view;
    for (const name of ["discover", "learn", "saved"]) {
      document.getElementById(`${name}-view`).hidden = name !== view;
    }
    document.querySelectorAll(".bottom-nav button").forEach((button) => {
      if (button.dataset.view === view) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (view === "saved") renderSaved();
    if (view === "learn") renderLearning();
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const toggleFavorite = (id) => {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    persist("ig:favorites:v1", state.favorites);
    renderDiscover();
    renderSaved();
    if ($("#term-dialog").open && state.currentTerm === id) openTerm(id);
  };
  const toggleMastered = (id) => {
    if (state.mastered.has(id)) state.mastered.delete(id);
    else state.mastered.add(id);
    persist("ig:mastered:v1", state.mastered);
    renderLearning();
    if ($("#term-dialog").open && state.currentTerm === id) openTerm(id);
  };
  const applyTheme = (theme) => {
    if (theme === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
    $("#theme-select").value = theme;
    storage.set("ig:theme:v1", theme);
  };
  const bindEvents = () => {
    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-open]");
      if (open) { openTerm(open.dataset.open); return; }
      const fav = event.target.closest("[data-favorite]");
      if (fav) { toggleFavorite(fav.dataset.favorite); return; }
      const mastered = event.target.closest("[data-mastered]");
      if (mastered) { toggleMastered(mastered.dataset.mastered); return; }
      const cat = event.target.closest("[data-category]");
      if (cat) { state.category = cat.dataset.category; renderDiscover(); return; }
      const view = event.target.closest("[data-view]");
      if (view) { setView(view.dataset.view); return; }
      const diagramNode = event.target.closest(".diagram-svg [data-term]");
      if (diagramNode) { openTerm(diagramNode.dataset.term); return; }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName) && !$("#term-dialog").open) {
        event.preventDefault(); setView("discover"); $("#search-input").focus();
      }
      const diagramNode = event.target.closest?.(".diagram-svg [data-term]");
      if (diagramNode && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault(); openTerm(diagramNode.dataset.term);
      }
    });
    $("#search-input").addEventListener("input", renderDiscover);
    $("#saved-search-input").addEventListener("input", renderSaved);
    $("#clear-search").addEventListener("click", () => { $("#search-input").value = ""; state.category = "all"; renderDiscover(); $("#search-input").focus(); });
    $("#explore-terms").addEventListener("click", () => setView("discover"));
    $("#refresh-recs").addEventListener("click", () => { if (state.data) refreshRecommendations(); });
    $("#dialog-close").addEventListener("click", () => $("#term-dialog").close());
    $("#term-dialog").addEventListener("click", (event) => { if (event.target === $("#term-dialog")) $("#term-dialog").close(); });
    $("#term-dialog").addEventListener("close", () => { state.currentTerm = null; state.lastFocus?.focus?.(); });
    $("#theme-select").addEventListener("change", (event) => applyTheme(event.target.value));
    $("#install-btn").addEventListener("click", async () => {
      if (state.installPrompt) { state.installPrompt.prompt(); await state.installPrompt.userChoice; state.installPrompt = null; }
      else toast("iPhone：Safari 分享 → 添加到主屏幕；Android：浏览器菜单 → 安装应用。");
    });
    window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); state.installPrompt = event; });
  };
  const init = async () => {
    bindEvents();
    const savedTheme = storage.get("ig:theme:v1");
    if (["light", "dark"].includes(savedTheme)) applyTheme(savedTheme);
    try {
      const response = await fetch("./data/glossary.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.data = await response.json();
      state.byId = new Map(state.data.terms.map((term) => [term.id, term]));
      state.favorites = readSet("ig:favorites:v1");
      state.mastered = readSet("ig:mastered:v1");
      $("#hero-term-count").textContent = String(state.data.terms.length);
      renderDiscover(); renderSaved(); renderDiagrams(); refreshRecommendations();
      if (!state.storageOK) toast("本地存储不可用；收藏和进度仅在本次会话有效。");
    } catch (error) {
      $("#result-count").textContent = "词库加载失败";
      $("#term-grid").innerHTML = `<div class="empty-state"><h3>暂时无法加载词库</h3><p>请检查网络，首次成功加载后可离线使用。</p><button type="button" class="text-button" onclick="location.reload()">重试加载</button></div>`;
      console.error("Glossary data load failed:", error);
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("Offline support unavailable:", error));
    }
  };
  init();
})();
