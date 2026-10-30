#!/usr/bin/env python3
"""Internalize site links for the analytikos.duckdns.org deployment.

Rewrites every ``https://michaelnocito.github.io/analyst-prep-kit/...`` reference
in the files served by the site:

* ``*.html`` (two passes)
    1. SEO contexts -> ABSOLUTE URL on the new domain:
       - ``<link rel="canonical">``
       - ``<meta property="og:*">`` / ``<meta name="twitter:*">``
         (og:url, og:image, twitter:url, twitter:image — scrapers need absolute URLs)
       - ``<script type="application/ld+json">`` structured data
       - other ``<script>`` blocks (share/copy-URL strings built at runtime,
         e.g. the plan certificate pages — copied text must work standalone)
    2. Everything else (href/src/action/poster/...) -> RELATIVE path computed
       from the file's own location.  Directory targets keep their trailing
       slash; a link to the page's own directory becomes ``./``.
* ``sitemap.xml``  -> absolute URLs on the new domain (path preserved).
* ``robots.txt``   -> Sitemap directive on the new domain.
* ``README.md``    -> absolute URL on the new domain (README is rendered on
  GitHub, not inside the site, so relative links would break there).

Explicitly NOT touched (dev-only material, kept per project rules):
all other ``*.md`` (HANDOFF-*, ROADMAP, crosspost-src/*, ...), ``*.py``
build scripts, ``tools/*.json`` caches, ``crosspost-src/*``.

Links to OTHER projects (e.g. ``https://michaelnocito.github.io/keygarden/``)
and the bare profile URL ``https://michaelnocito.github.io`` are untouched.

Usage:  python3 tools/rewrite_links_to_relative.py [--dry-run]
Idempotent: a second run finds nothing to rewrite.
"""

from __future__ import annotations

import argparse
import posixpath
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OLD_BASE = "https://michaelnocito.github.io/analyst-prep-kit"
NEW_BASE = "https://analytikos.duckdns.org"

# The base URL only when NOT followed by more repo-name characters
# (guards against similarly-named projects, e.g. analyst-prep-kit-2).
# Optional path segment, then optional ?query#fragment suffix.
URL_RE = re.compile(
    re.escape(OLD_BASE) + r'(?P<path>/[^"\'\s<>?)#]*)?(?P<suffix>[?#][^"\'\s<>]*)?'
    r'(?![A-Za-z0-9_-])'
)

# <script type="application/ld+json"> ... </script>
JSONLD_RE = re.compile(
    r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>.*?</script>',
    re.IGNORECASE | re.DOTALL,
)
# Any remaining <script> ... </script> (inline JS)
SCRIPT_RE = re.compile(r'<script\b[^>]*>.*?</script>', re.IGNORECASE | re.DOTALL)
# SEO tags that must keep absolute URLs
SEO_TAG_RE = re.compile(
    r'<link\b[^>]*rel=["\']canonical["\'][^>]*>'
    r'|<meta\b[^>]*?(?:property|name)=["\'](?:og|twitter):[^"\']*["\'][^>]*>',
    re.IGNORECASE,
)

TOKEN_RE = re.compile(r"\x00SEO(\d+)\x00")


def to_absolute(match: re.Match) -> str:
    return NEW_BASE + (match.group("path") or "/") + (match.group("suffix") or "")


def to_relative(match: re.Match, file_dir: str) -> str:
    path = match.group("path") or "/"
    suffix = match.group("suffix") or ""
    target = path.lstrip("/")
    trailing_slash = target.endswith("/")
    norm = target.rstrip("/")
    rel = posixpath.relpath(norm or ".", file_dir or ".")
    if rel == ".":
        rel = "./"
    elif trailing_slash:
        rel += "/"
    return rel + suffix


def rewrite_html(text: str, file_dir: str, report: list[str], relpath_str: str) -> str:
    """Two-pass rewrite: SEO contexts -> absolute, everything else -> relative."""
    protected: list[str] = []

    def protect(m: re.Match) -> str:
        protected.append(m.group(0))
        return f"\x00SEO{len(protected) - 1}\x00"

    # --- Pass 1a: JSON-LD structured data -> absolute new domain
    text = JSONLD_RE.sub(lambda m: URL_RE.sub(to_absolute, m.group(0)), text)
    # --- Pass 1b: other inline <script> blocks (runtime share URLs) -> absolute
    def script_abs(m: re.Match) -> str:
        block = m.group(0)
        for path, suffix in URL_RE.findall(block):
            report.append(
                f"  ABSOLUTE(script share-URL): {relpath_str}: "
                f"{OLD_BASE}{path or '/'}{suffix or ''}"
            )
        return URL_RE.sub(to_absolute, block)

    text = SCRIPT_RE.sub(script_abs, text)
    # --- Pass 1c: canonical + og/twitter metas -> absolute new domain
    text = SEO_TAG_RE.sub(lambda m: URL_RE.sub(to_absolute, m.group(0)), text)

    # --- Hide every pass-1 (absolute) URL so pass 2 leaves it alone
    text = re.sub(
        re.escape(NEW_BASE) + r'[^\s"\'<>]*',
        protect,
        text,
    )

    # --- Pass 2: all remaining old-domain URLs -> relative
    text = URL_RE.sub(lambda m: to_relative(m, file_dir), text)

    # --- Pass 3: leftover plain-text mentions of the old host (visible URL
    #     text inside elements, e.g. "michaelnocito.github.io/analyst-prep-kit/plan")
    #     -> new host so nothing leaks (full URLs are already gone after pass 2)
    text = re.sub(
        r'(?<![\w.-])michaelnocito\.github\.io/analyst-prep-kit(?![A-Za-z0-9_-])',
        "analytikos.duckdns.org",
        text,
    )

    # --- Restore pass-1 (absolute) chunks
    text = TOKEN_RE.sub(lambda m: protected[int(m.group(1))], text)
    return text


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="report only, write nothing")
    parser.add_argument("--root", type=Path, default=ROOT, help="site root (default: repo root)")
    args = parser.parse_args()
    root: Path = args.root.resolve()

    changed = 0
    report: list[str] = []

    OLD_HOST_PATH = "michaelnocito.github.io/analyst-prep-kit"

    html_files = sorted(p for p in root.rglob("*.html") if ".git" not in p.parts)
    for path in html_files:
        original = path.read_text(encoding="utf-8")
        if OLD_HOST_PATH not in original:
            continue
        rel = path.relative_to(root).as_posix()
        file_dir = posixpath.dirname(rel)
        rewritten = rewrite_html(original, file_dir, report, rel)
        if rewritten != original:
            changed += 1
            if not args.dry_run:
                path.write_text(rewritten, encoding="utf-8")
            print(f"{'[dry] ' if args.dry_run else ''}html: {rel}")

    # Root-level simple replace files (SEO/service metadata, README on GitHub)
    for name in ("sitemap.xml", "robots.txt", "README.md"):
        path = root / name
        if not path.is_file():
            continue
        original = path.read_text(encoding="utf-8")
        if OLD_BASE in original:
            rewritten = original.replace(OLD_BASE, NEW_BASE)
            changed += 1
            if not args.dry_run:
                path.write_text(rewritten, encoding="utf-8")
            print(f"{'[dry] ' if args.dry_run else ''}text: {name}")

    if report:
        print("\nAbsolute (new-domain) rewrites that are NOT navigation links:")
        for line in report:
            print(line)

    print(f"\n{'Would change' if args.dry_run else 'Changed'} files: {changed}")
    remaining = sum(
        OLD_HOST_PATH in p.read_text(encoding="utf-8")
        for p in root.rglob("*")
        if p.is_file() and ".git" not in p.parts
        and p.suffix in {".html", ".xml", ".js", ".css", ".txt"}
    )
    print(f"Remaining OLD_BASE refs in site files (html/xml/js/css/txt): {remaining}")
    return 0 if remaining == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
