#!/usr/bin/env python3

from __future__ import annotations

import html
import json
import re
import sqlite3
from pathlib import Path
from typing import Dict, List


ROOT = Path(__file__).resolve().parent
BASE_PATH_PREFIX = "metronic/v9.4.5"


def read_html_files() -> List[Path]:
    files: List[Path] = []
    for path in ROOT.rglob("*.html"):
        if any(part.startswith("_") for part in path.parts):
            continue
        files.append(path)

    files.sort()
    return files


def normalize_url(url: str, fallback_slug: str) -> str:
    if not url:
        return f"https://docs.keenthemes.com/{fallback_slug}"

    url = url.strip()
    url = url.replace("/undefined/", "/")
    return url


def infer_section(relative_html_path: str, title: str) -> str:
    normalized = relative_html_path.replace("\\", "/")

    if normalized == "index.html":
        if "shoplit" in title.lower():
            return "shoplit"
        if "metronic nextjs" in title.lower():
            return "metronic-nextjs"
        return "index"

    if normalized.startswith("shoplit/") or normalized == "shoplit.html":
        return "shoplit"

    if normalized.startswith("metronic-nextjs/") or normalized == "metronic-nextjs.html":
        return "metronic-nextjs"

    first = normalized.split("/", 1)[0]
    return first.replace(".html", "")


def html_to_markdownish(raw_html: str) -> str:
    body_match = re.search(r"</head>(.*)</html>", raw_html, flags=re.IGNORECASE | re.DOTALL)
    content = body_match.group(1) if body_match else raw_html

    marker = "<script>(self.__next_f=self.__next_f||[]).push([0])"
    marker_pos = content.find(marker)
    if marker_pos != -1:
        content = content[:marker_pos]

    code_blocks: List[str] = []

    def replace_pre(match: re.Match[str]) -> str:
        code_html = match.group(1)
        code_text = re.sub(r"<[^>]+>", "", code_html)
        code_text = html.unescape(code_text)
        code_text = code_text.replace("\r\n", "\n").replace("\r", "\n").strip("\n")
        token = f"CODEBLOCK_TOKEN_{len(code_blocks)}"
        code_blocks.append(code_text)
        return f"\n\n{token}\n\n"

    content = re.sub(
        r"<pre[^>]*>\s*<code[^>]*>(.*?)</code>\s*</pre>",
        replace_pre,
        content,
        flags=re.IGNORECASE | re.DOTALL,
    )

    content = re.sub(r"<script[^>]*>.*?</script>", "", content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r"<style[^>]*>.*?</style>", "", content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r"<svg[^>]*>.*?</svg>", "", content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r"<button[^>]*>.*?</button>", "", content, flags=re.IGNORECASE | re.DOTALL)

    content = re.sub(r"<li[^>]*>", "\n- ", content, flags=re.IGNORECASE)
    content = re.sub(r"</li>", "", content, flags=re.IGNORECASE)

    def heading_open(match: re.Match[str]) -> str:
        level = int(match.group(1))
        level = max(1, min(level, 6))
        return "\n" + ("#" * level) + " "

    content = re.sub(r"<h([1-6])[^>]*>", heading_open, content, flags=re.IGNORECASE)
    content = re.sub(r"</h[1-6]>", "\n", content, flags=re.IGNORECASE)

    block_tags = [
        "p",
        "ul",
        "ol",
        "div",
        "section",
        "article",
        "main",
        "blockquote",
        "table",
        "thead",
        "tbody",
        "tr",
        "td",
        "th",
        "hr",
        "br",
    ]
    for tag in block_tags:
        content = re.sub(rf"<{tag}[^>]*>", "\n", content, flags=re.IGNORECASE)
        if tag != "br":
            content = re.sub(rf"</{tag}>", "\n", content, flags=re.IGNORECASE)

    content = re.sub(r"<a[^>]*>", "", content, flags=re.IGNORECASE)
    content = re.sub(r"</a>", "", content, flags=re.IGNORECASE)

    content = re.sub(r"<[^>]+>", "", content)
    content = html.unescape(content)
    content = content.replace("\r\n", "\n").replace("\r", "\n")

    lines: List[str] = []
    empty = 0

    for raw_line in content.split("\n"):
        line = re.sub(r"\s+", " ", raw_line).strip()
        if not line:
            empty += 1
            if empty <= 1:
                lines.append("")
            continue

        empty = 0
        lines.append(line)

    text = "\n".join(lines).strip()

    for idx, code in enumerate(code_blocks):
        token = f"CODEBLOCK_TOKEN_{idx}"
        fenced = f"```text\n{code}\n```"
        text = text.replace(token, fenced)

    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def build_record(html_file: Path) -> Dict[str, str]:
    rel_html = html_file.relative_to(ROOT).as_posix()
    rel_md = rel_html.replace(".html", ".md")
    slug = rel_html.replace(".html", "")

    raw = html_file.read_text(encoding="utf-8", errors="ignore")

    title_match = re.search(r"<title>(.*?)</title>", raw, flags=re.IGNORECASE | re.DOTALL)
    title = html.unescape(title_match.group(1).strip()) if title_match else slug

    og_url_match = re.search(
        r"<meta[^>]+property=[\"']og:url[\"'][^>]+content=[\"'](.*?)[\"'][^>]*>",
        raw,
        flags=re.IGNORECASE | re.DOTALL,
    )
    og_url = og_url_match.group(1).strip() if og_url_match else ""
    url = normalize_url(og_url, slug)

    section = infer_section(rel_html, title)
    content = html_to_markdownish(raw)

    md_full_path = ROOT / rel_md
    md_full_path.parent.mkdir(parents=True, exist_ok=True)

    frontmatter = "\n".join(
        [
            "---",
            f'title: "{title.replace(chr(34), chr(92) + chr(34))}"',
            f'url: "{url.replace(chr(34), chr(92) + chr(34))}"',
            f'section: "{section.replace(chr(34), chr(92) + chr(34))}"',
            "---",
            "",
        ]
    )

    md_full_path.write_text(frontmatter + content + "\n", encoding="utf-8")

    return {
        "title": title,
        "url": url,
        "section": section,
        "path": f"{BASE_PATH_PREFIX}/{rel_md}",
        "content": frontmatter + content + "\n",
    }


def write_indexes(records: List[Dict[str, str]]) -> None:
    index_json_path = ROOT / "index.json"
    index_jsonl_path = ROOT / "index.jsonl"

    reduced = [
        {
            "title": r["title"],
            "url": r["url"],
            "section": r["section"],
            "path": r["path"],
        }
        for r in records
    ]

    index_json_path.write_text(json.dumps(reduced, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    with index_jsonl_path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def write_sqlite(records: List[Dict[str, str]]) -> None:
    db_path = ROOT / "docs.db"
    for suffix in ["", "-shm", "-wal"]:
        candidate = ROOT / f"docs.db{suffix}"
        if candidate.exists():
            candidate.unlink()

    conn = sqlite3.connect(db_path)
    try:
        conn.execute("CREATE VIRTUAL TABLE docs USING fts5(title, url, section, path, content)")
        conn.executemany(
            "INSERT INTO docs (title, url, section, path, content) VALUES (?, ?, ?, ?, ?)",
            [(r["title"], r["url"], r["section"], r["path"], r["content"]) for r in records],
        )
        conn.commit()
    finally:
        conn.close()


def main() -> None:
    html_files = read_html_files()
    records = [build_record(path) for path in html_files]
    records.sort(key=lambda item: item["path"])

    write_indexes(records)
    write_sqlite(records)

    print(f"Generated {len(records)} docs entries at {ROOT}")


if __name__ == "__main__":
    main()
