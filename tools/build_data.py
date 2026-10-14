"""Validate the editorial source and generate the static glossary JSON."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "content" / "terms.psv"
TARGET = ROOT / "data" / "glossary.json"
EXPECTED = [22, 18, 29, 42, 16, 22, 19, 12]


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def main() -> None:
    categories = []
    terms = []
    current = None
    for number, raw in enumerate(SOURCE.read_text(encoding="utf-8").splitlines(), 1):
        line = raw.strip()
        if not line:
            continue
        if line.startswith("# "):
            parts = [part.strip() for part in line[2:].split("|")]
            if len(parts) != 3:
                raise ValueError(f"Category line {number}: expected id|name|description")
            current = {"id": parts[0], "name": parts[1], "description": parts[2]}
            categories.append(current)
            continue
        if current is None:
            raise ValueError(f"Term on line {number} has no category")
        parts = [part.strip() for part in line.split("|")]
        if not 6 <= len(parts) <= 8 or any(not value for value in parts[:6]):
            raise ValueError(f"Term line {number}: six required nonempty fields")
        term, full, zh, practical, plain, related = parts[:6]
        entry = {
            "id": slug(term),
            "category": current["id"],
            "term": term,
            "fullName": full,
            "zh": zh,
            "practical": practical,
            "plain": plain,
            "related": [item.strip() for item in related.split(",")],
        }
        if len(parts) > 6 and parts[6]:
            entry["note"] = parts[6]
        if len(parts) > 7 and parts[7]:
            entry["aliases"] = [item.strip() for item in parts[7].split(",")]
        terms.append(entry)
    if len(categories) != len(EXPECTED) or len(terms) != sum(EXPECTED):
        raise ValueError(f"Expected {len(EXPECTED)} categories and {sum(EXPECTED)} terms; got {len(categories)} and {len(terms)}")
    ids = [term["id"] for term in terms]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate term ID")
    by_label = {term["term"].casefold(): term["id"] for term in terms}
    if len(by_label) != len(terms):
        raise ValueError("Duplicate term label")
    for category, expected in zip(categories, EXPECTED):
        actual = sum(term["category"] == category["id"] for term in terms)
        if actual != expected:
            raise ValueError(f"{category['name']}: expected {expected}, got {actual}")
        category["count"] = actual
    for term in terms:
        resolved = []
        for label in term["related"]:
            ref = by_label.get(label.casefold())
            if not ref or ref == term["id"]:
                raise ValueError(f"Invalid related link for {term['term']}: {label}")
            resolved.append(ref)
        term["related"] = list(dict.fromkeys(resolved))
    output = {
        "version": "1.1.0",
        "updated": "2026-10-14",
        "categories": categories,
        "terms": terms,
    }
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {TARGET}: {len(terms)} terms in {len(categories)} categories")


if __name__ == "__main__":
    main()
