"""Content checks and Chromium/WebKit smoke tests for the static release."""
import json
import os
import re
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "test-results"
OUT.mkdir(exist_ok=True)
(ROOT / ".tmp").mkdir(exist_ok=True)
os.environ["PLAYWRIGHT_BROWSERS_PATH"] = str(ROOT / ".playwright-browsers")
os.environ["TEMP"] = str(ROOT / ".tmp")
os.environ["TMP"] = str(ROOT / ".tmp")

from playwright.sync_api import sync_playwright, expect  # noqa: E402


def content_checks():
    data = json.loads((ROOT / "data" / "glossary.json").read_text(encoding="utf-8"))
    terms = data["terms"]
    categories = data["categories"]
    assert len(terms) == 180 and len(categories) == 8
    assert [item["count"] for item in categories] == [22, 18, 29, 42, 16, 22, 19, 12]
    ids = [term["id"] for term in terms]
    assert len(ids) == len(set(ids))
    for term in terms:
        assert all(isinstance(term.get(key), str) and term[key].strip() for key in ("term", "fullName", "zh", "practical", "plain"))
        assert len(term["related"]) >= 2 and all(ref in ids and ref != term["id"] for ref in term["related"])
        assert not re.search(r"TODO|TBD|lorem|placeholder|待补充|示例词条", json.dumps(term, ensure_ascii=False), re.I)
    for label in ("vc", "pe", "cvc", "dd", "ts", "ic", "spa", "sha", "spv", "jv", "ev", "dcf", "irr", "moic", "wacc", "ebitda", "fcf", "roic", "gp", "lp", "dpi", "tvpi", "arr", "nrr", "cac", "ltv", "pmi", "oci", "fvoci", "ac", "fvtpl", "p-l", "sppi", "ecl", "eir", "bs", "cfs", "a-r", "a-p", "cogs", "sg-a", "d-a", "eps", "ppa", "goodwill", "nci", "deferred-revenue", "fair-value", "fair-value-hierarchy", "impairment", "ifrs", "us-gaap", "opex", "cagr", "ttm", "yoy", "tam"):
        assert label in ids
    by_id = {term["id"]: term for term in terms}
    assert "Gross Profit" in by_id["gp"]["note"] and "Term Sheet" in by_id["ts"]["note"]
    assert "EBITDA 不是现金流" in by_id["ebitda"]["note"]
    assert "TVPI=DPI+RVPI" in by_id["tvpi"]["note"]
    assert "不重分类" in by_id["fvoci"]["note"] and "不重分类" in by_id["oci"]["note"]
    assert "Acquisition Cost" in by_id["ac"]["note"]
    assert "FVPL" in by_id["fvtpl"]["aliases"]
    return {"terms": len(terms), "categories": len(categories), "counts": [item["count"] for item in categories], "related_links": sum(len(term["related"]) for term in terms)}


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def run_browser(browser_type, base, name, viewport, is_mobile=False, full=False):
    browser = browser_type.launch(headless=True)
    context = browser.new_context(viewport=viewport, device_scale_factor=1, is_mobile=is_mobile, has_touch=is_mobile, service_workers="allow")
    page = context.new_page()
    errors = []
    failed_responses = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("response", lambda response: failed_responses.append(f"{response.status} {response.url}") if response.status >= 400 else None)
    page.goto(base, wait_until="networkidle")
    expect(page.locator("#result-count")).to_have_text("找到 180 个术语")
    assert page.locator("#term-grid .term-card").count() == 180
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
    page.screenshot(path=str(OUT / f"{name}-home.png"), full_page=False)
    page.locator("#search-input").fill("Internal Rate of Return")
    expect(page.locator("#result-count")).to_have_text("找到 1 个术语")
    page.locator("#search-input").fill("内部收益率")
    expect(page.locator("#term-grid .term-card")).to_have_count(1)
    page.locator("#search-input").fill("FVPL")
    expect(page.locator("#term-grid .term-card")).to_have_count(1)
    page.locator("#search-input").fill("其他综合收益")
    expect(page.locator("#term-grid .term-card")).to_have_count(2)
    page.locator("#search-input").fill("")
    page.locator('[data-category="process"]').click()
    expect(page.locator("#result-count")).to_have_text("找到 22 个术语")
    page.locator('[data-category="all"]').click()
    page.locator("#search-input").fill("内部收益率")
    page.locator("#term-grid .card-main").click()
    expect(page.locator("#term-dialog")).to_be_visible()
    expect(page.locator("#dialog-term")).to_have_text("IRR")
    page.locator('#dialog-body [data-open="moic"]').click()
    expect(page.locator("#dialog-term")).to_have_text("MOIC")
    page.locator("#dialog-close").click()
    page.locator('[data-favorite="irr"]').first.click()
    page.locator('[data-view="saved"]').click()
    expect(page.locator("#saved-grid .term-card")).to_have_count(1)
    page.locator("#saved-search-input").fill("IRR")
    expect(page.locator("#saved-grid .term-card")).to_have_count(1)
    page.reload(wait_until="networkidle")
    page.locator('[data-view="saved"]').click()
    expect(page.locator("#saved-grid .term-card")).to_have_count(1)
    page.locator('[data-view="learn"]').click()
    expect(page.locator("#recommendations .recommendation")).to_have_count(5)
    recommended = page.locator("#recommendations .recommendation").first.get_attribute("data-open")
    page.locator("#recommendations .recommendation").first.click()
    page.locator(f'#dialog-body [data-mastered="{recommended}"]').click()
    expect(page.locator("#progress-copy")).to_have_text("已掌握 1 / 180 个术语")
    page.locator("#dialog-close").click()
    expect(page.locator("#diagram-grid .diagram-card")).to_have_count(6)
    page.locator('#diagram-grid [data-term="ev"]').click()
    expect(page.locator("#dialog-term")).to_have_text("EV")
    page.locator("#dialog-close").click()
    page.locator('#diagram-grid [data-term="irr"]').first.focus()
    page.keyboard.press("Enter")
    expect(page.locator("#dialog-term")).to_have_text("IRR")
    page.locator("#dialog-close").click()
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
    page.screenshot(path=str(OUT / f"{name}-diagrams.png"), full_page=True)
    page.locator("#theme-select").select_option("dark")
    expect(page.locator("html")).to_have_attribute("data-theme", "dark")
    page.screenshot(path=str(OUT / f"{name}-dark.png"), full_page=False)
    page.reload(wait_until="networkidle")
    expect(page.locator("html")).to_have_attribute("data-theme", "dark")
    page.locator('[data-view="learn"]').click()
    expect(page.locator("#progress-copy")).to_have_text("已掌握 1 / 180 个术语")
    if full:
        page.evaluate("navigator.serviceWorker.ready")
        page.reload(wait_until="networkidle")
        assert page.evaluate("Boolean(navigator.serviceWorker.controller)")
        context.set_offline(True)
        page.reload(wait_until="domcontentloaded")
        expect(page.locator("#result-count")).to_have_text("找到 180 个术语")
        context.set_offline(False)
    assert not errors, f"JavaScript errors: {errors}"
    assert not failed_responses, f"HTTP failures: {failed_responses}"
    context.close()
    browser.close()
    return {"engine": name, "viewport": viewport, "search": "pass", "category": "pass", "favorite_persistence": "pass", "mastered_persistence": "pass", "diagrams": 6, "theme": "pass", "offline": "pass" if full else "not tested", "page_errors": 0, "http_errors": 0}


def main():
    report = {"content": content_checks(), "browsers": []}
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}/"
    try:
        with sync_playwright() as playwright:
            report["browsers"].append(run_browser(playwright.chromium, base, "chromium-mobile-375", {"width": 375, "height": 812}, True, True))
            report["browsers"].append(run_browser(playwright.chromium, base, "chromium-android-393", {"width": 393, "height": 851}, True))
            report["browsers"].append(run_browser(playwright.chromium, base, "chromium-desktop-1440", {"width": 1440, "height": 900}))
            try:
                report["browsers"].append(run_browser(playwright.webkit, base, "webkit-mobile-375", {"width": 375, "height": 812}, True))
            except Exception as exc:
                if "Executable doesn't exist" in str(exc):
                    report["webkit_limit"] = "WebKit binary unavailable"
                else:
                    raise
    finally:
        server.shutdown()
    (OUT / "qa-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
