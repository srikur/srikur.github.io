#!/usr/bin/env python3
"""Render markdown/*.md into public/posts/<slug>.html and rewrite the blog
section of public/index.html.

Each markdown file must begin with a YAML frontmatter block:

    ---
    title: Post Title
    date: 2024-07-25
    slug: post-slug
    draft: false   # optional; drafts are skipped
    ---

Run with `python3 build.py` from the repo root. The GitHub Actions deploy
workflow runs this automatically before uploading public/ to GitHub Pages.
"""

from __future__ import annotations

import re
import sys
from datetime import date, datetime
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent
MD_DIR = ROOT / "markdown"
PUBLIC_DIR = ROOT / "public"
POSTS_DIR = PUBLIC_DIR / "posts"
INDEX_FILE = PUBLIC_DIR / "index.html"

POSTS_START = "<!-- POSTS_START -->"
POSTS_END = "<!-- POSTS_END -->"

THEME_SCRIPT = """    <script>
        (function() {
            const saved = localStorage.getItem('theme');
            if (saved) document.documentElement.setAttribute('data-theme', saved);
        })();
    </script>"""

THEME_TOGGLE = """    <button class="theme-toggle" aria-label="Toggle dark mode">
        <svg class="sun-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
        <svg class="moon-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>
    </button>"""

THEME_TOGGLE_JS = """    <script>
        document.querySelector('.theme-toggle').addEventListener('click', function() {
            const root = document.documentElement;
            const current = root.getAttribute('data-theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            let newTheme;
            if (current === 'dark' || (!current && prefersDark)) {
                newTheme = 'light';
            } else {
                newTheme = 'dark';
            }

            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    </script>"""

POST_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Srikur's Dev Page</title>
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="stylesheet" href="../css/styles.css">
{theme_script}
</head>
<body>
{theme_toggle}
    <main class="container">
        <nav class="back-link">
            <a href="../index.html">← Back to home</a>
        </nav>

        <article>
            <header class="post-header">
                <h1>{title}</h1>
                <p class="post-date">{date_display}</p>
            </header>

            <div class="post-content">
{content}
            </div>
        </article>
    </main>
{theme_toggle_js}
</body>
</html>
"""

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)


def parse_frontmatter(text: str) -> tuple[dict, str]:
    m = FRONTMATTER_RE.match(text)
    if not m:
        raise ValueError("missing YAML frontmatter")
    meta: dict = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            raise ValueError(f"bad frontmatter line: {line!r}")
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip().strip('"').strip("'")
    return meta, text[m.end():]


def parse_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def format_date(d: date) -> str:
    return d.strftime("%B %-d, %Y")


def render_post(md_path: Path) -> dict | None:
    raw = md_path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(raw)

    if meta.get("draft", "false").lower() == "true":
        print(f"  skip (draft): {md_path.name}")
        return None

    title = meta["title"]
    slug = meta.get("slug", md_path.stem)
    post_date = parse_date(meta["date"])

    html_body = markdown.markdown(
        body,
        extensions=["extra", "sane_lists"],
        output_format="html5",
    )

    out = POST_TEMPLATE.format(
        title=title,
        date_display=format_date(post_date),
        content=html_body,
        theme_script=THEME_SCRIPT,
        theme_toggle=THEME_TOGGLE,
        theme_toggle_js=THEME_TOGGLE_JS,
    )

    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = POSTS_DIR / f"{slug}.html"
    out_path.write_text(out, encoding="utf-8")
    print(f"  wrote: posts/{slug}.html")

    return {"title": title, "slug": slug, "date": post_date}


def update_index(posts: list[dict]) -> None:
    posts.sort(key=lambda p: p["date"], reverse=True)

    items = []
    for p in posts:
        items.append(
            f'                <li>\n'
            f'                    <span class="date">{p["date"].isoformat()}</span>\n'
            f'                    <a href="posts/{p["slug"]}.html">{p["title"]}</a>\n'
            f'                </li>'
        )
    block = "\n            <ul>\n" + "\n".join(items) + "\n            </ul>\n            "

    text = INDEX_FILE.read_text(encoding="utf-8")
    pattern = re.compile(
        re.escape(POSTS_START) + r".*?" + re.escape(POSTS_END),
        re.DOTALL,
    )
    if not pattern.search(text):
        raise SystemExit(
            f"could not find {POSTS_START}/{POSTS_END} markers in {INDEX_FILE}"
        )
    new_text = pattern.sub(POSTS_START + block + POSTS_END, text)
    INDEX_FILE.write_text(new_text, encoding="utf-8")
    print(f"  updated: {INDEX_FILE.relative_to(ROOT)}")


def main() -> int:
    if not MD_DIR.is_dir():
        print(f"no markdown/ directory at {MD_DIR}", file=sys.stderr)
        return 1

    print("building posts...")
    posts = []
    for md_path in sorted(MD_DIR.glob("*.md")):
        try:
            result = render_post(md_path)
        except Exception as e:
            print(f"  FAILED {md_path.name}: {e}", file=sys.stderr)
            return 1
        if result:
            posts.append(result)

    update_index(posts)
    print(f"done. {len(posts)} post(s) published.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
