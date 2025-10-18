from __future__ import annotations

import argparse
import ast
import fnmatch
import hashlib
import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

"""
project_to_markdown.py

Dump an entire project into one Markdown file optimized for
long-context LLM discussion (e.g., ChatGPT).

Key points in this build:
- Robust ignore matcher:
  - Supports .gitignore-like "**/name/**" (segment match) and glob fallback.
  - Works on both pruned directories (dirnames) and files (filenames).
- Walks with os.walk(topdown=True) and prunes branches in-place.
- Hidden files/dirs are INCLUDED by default (use --exclude-hidden to drop).
- Produces overview, metrics, TOC, (optional) Python import graph.
- Safe reading with size caps and binary sniffing.
"""

# -------------------------------------------------------------------
# Defaults
# -------------------------------------------------------------------

DEFAULT_IGNORES = [
    "**/.git/**",
    "**/.hg/**",
    "**/.svn/**",
    "**/__pycache__/**",
    "**/.mypy_cache/**",
    "**/.pytest_cache/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.venv/**",
    "**/venv/**",
    "**/cache/**",
    "**/assets/**",
    "package-lock.json",
    "package.json",
    ".DS_Store",
]

EXT_TO_LANG = {
    ".py": "python",
    ".ipynb": "json",
    ".js": "javascript",
    ".jsx": "jsx",
    ".ts": "typescript",
    ".tsx": "tsx",
    ".json": "json",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".toml": "toml",
    ".ini": "ini",
    ".cfg": "ini",
    ".sh": "bash",
    ".zsh": "bash",
    ".bash": "bash",
    ".ps1": "powershell",
    ".rb": "ruby",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".kt": "kotlin",
    ".swift": "swift",
    ".php": "php",
    ".c": "c",
    ".h": "c",
    ".hpp": "cpp",
    ".hh": "cpp",
    ".cpp": "cpp",
    ".cc": "cpp",
    ".m": "objectivec",
    ".mm": "objectivec",
    ".cs": "csharp",
    ".sql": "sql",
    ".md": "markdown",
    ".html": "html",
    ".htm": "html",
    ".css": "css",
    ".scss": "scss",
    ".less": "less",
    ".vue": "vue",
    ".svelte": "svelte",
    ".xml": "xml",
    ".gradle": "groovy",
    ".groovy": "groovy",
    ".dockerfile": "dockerfile",
    "Dockerfile": "dockerfile",
    ".dockerignore": "",
    ".env": "",
    ".txt": "",
    "": "",
}

COMMENT_PREFIXES = {
    "python": "#",
    "bash": "#",
    "ruby": "#",
    "ini": ";",
    "json": "",
    "yaml": "#",
    "toml": "#",
    "javascript": "//",
    "typescript": "//",
    "tsx": "//",
    "jsx": "//",
    "java": "//",
    "c": "//",
    "cpp": "//",
    "csharp": "//",
    "go": "//",
    "rust": "//",
    "php": "//",
    "swift": "//",
    "kotlin": "//",
    "objectivec": "//",
    "sql": "--",
    "html": "",
    "css": "",
    "markdown": "",
    "xml": "",
    "dockerfile": "#",
    "groovy": "//",
}

# -------------------------------------------------------------------
# CLI
# -------------------------------------------------------------------


def parse_args():
    p = argparse.ArgumentParser(
        description="Extract project files into one Markdown for LLM discussion."
    )
    p.add_argument("-r", "--root", required=True, help="Project root directory")
    p.add_argument(
        "-o", "--output", default=None, help="Output markdown (default: <project>_<ts>.md)"
    )
    p.add_argument(
        "--ignore", action="append", default=[], help="Ignore patterns (glob + ** segment support)"
    )
    p.add_argument("--exclude-hidden", action="store_true", help="Exclude dotfiles/directories")
    p.add_argument(
        "--max-bytes-per-file", type=int, default=300_000, help="Max bytes per file to include"
    )
    p.add_argument(
        "--only-ext", action="append", default=[], help="Whitelist extensions (repeatable)"
    )
    p.add_argument("--title", default=None, help="Top-level title")
    p.add_argument(
        "--md-policy",
        choices=["fence", "render", "skip"],
        default="fence",
        help="How to include project .md files",
    )
    p.add_argument("--top-n-largest", type=int, default=12, help="Show top-N largest/longest files")
    p.add_argument(
        "--mermaid-import-graph", action="store_true", help="Emit Mermaid graph for Python imports"
    )
    p.add_argument("--no-metrics", dest="with_metrics", action="store_false")
    p.add_argument("--no-summaries", dest="with_summaries", action="store_false")
    p.add_argument(
        "--report-tag",
        default="<!-- P2M_REPORT -->",
        help="A line that marks a file as a generated report; such files are excluded. "
        "Default: '<!-- P2M_REPORT -->'",
    )
    p.set_defaults(with_metrics=True, with_summaries=True)
    args = p.parse_args()

    if args.output is None:
        root = Path(args.root).resolve()
        proj = root.name
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        args.output = f"{proj}_{ts}.md"
    return args


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------


def has_report_tag_head(p, tag, sniff_bytes=8192):
    try:
        data = p.read_bytes()[:sniff_bytes]
    except Exception:
        return False
    if is_probably_binary(data[:4096]):
        return False
    s = data.decode("utf-8", errors="replace")

    lines = s.splitlines()
    i = 0
    if lines and lines[0].startswith("\ufeff"):
        lines[0] = lines[0].lstrip("\ufeff")
    while i < len(lines) and (lines[i].strip() == "" or lines[i].startswith("#!")):
        i += 1
    if i < len(lines):
        return lines[i].strip() == tag.strip()
    return False


def norm_patterns(patterns):
    return [pat.strip() for pat in patterns if pat and pat.strip()]


def is_hidden_path(path):
    return any(part.startswith(".") and part not in (".", "..") for part in path.parts)


def rel_str(root, p):
    try:
        s = str(p.relative_to(root)).replace(os.sep, "/")
    except ValueError:
        s = str(p).replace(os.sep, "/")
    return "" if s == "." else s


def _segment_match(s_rel, pattern):
    """
    Support .gitignore-like '**/<name>/**' meaning: any path that contains a segment == <name>.
    """
    p = pattern.replace(os.sep, "/").strip("/")
    if p.startswith("**/") and p.endswith("/**"):
        core = p[3:-3]
        if "/" in core or not core:
            return False
        parts = s_rel.strip("/").split("/") if s_rel else []
        return core in parts
    return False


def matches_ignore(root, rel_path, patterns):
    s = rel_path.replace(os.sep, "/").strip("/")
    base = s.rsplit("/", 1)[-1] if s else ""

    for pat in patterns:
        pat_n = pat.replace(os.sep, "/").strip("/")
        if _segment_match(s, pat_n):
            return True
        if fnmatch.fnmatchcase(s, pat_n):
            return True
        if base and fnmatch.fnmatchcase(base, pat_n):
            return True
    return False


def detect_language(path):
    return "dockerfile" if path.name == "Dockerfile" else EXT_TO_LANG.get(path.suffix, "")


def is_probably_binary(sample):
    if b"\x00" in sample:
        return True
    try:
        sample.decode("utf-8")
        return False
    except UnicodeDecodeError:
        return True


def read_text_safely(p, max_bytes):
    data = p.read_bytes()
    nbytes = len(data)
    truncated = False
    if nbytes > max_bytes:
        data = data[:max_bytes]
        truncated = True
    if is_probably_binary(data[:4096]):
        return ("", False, nbytes)
    text = data.decode("utf-8", errors="replace")
    return (text, truncated, nbytes)


def sha1_of_text(s):
    return hashlib.sha1(s.encode("utf-8", errors="ignore")).hexdigest()


def sloc_of_text(text, lang):
    com = COMMENT_PREFIXES.get(lang or "", None)
    cnt = 0
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if com and stripped.startswith(com):
            continue
        cnt += 1
    return cnt


def count_todos(text):
    return len(re.findall(r"\bTODO\b|FIXME|XXX", text, flags=re.IGNORECASE))


def extract_brief_description(text, lang, max_lines=5):
    t = text.lstrip()
    if lang == "python":
        if t.startswith(('"""', "'''")):
            q = t[:3]
            end = t.find(q, 3)
            if end != -1:
                doc = t[3:end]
                return "\n".join(doc.strip().splitlines()[:max_lines])
    prefix = COMMENT_PREFIXES.get(lang, "")
    if prefix:
        lines = []
        for line in text.splitlines():
            if line.strip().startswith(prefix):
                cleaned = line.strip()[len(prefix) :].lstrip()
                lines.append(cleaned)
                if len(lines) >= max_lines:
                    break
            elif line.strip() == "":
                if lines:
                    lines.append("")
            else:
                break
        out = "\n".join(lines).strip()
        if out:
            return out
    return "\n".join(text.splitlines()[:2]).strip()


def auto_summary(text, lang, max_len=200):
    if not text:
        return ""
    if lang == "markdown":
        for line in text.splitlines():
            m = re.match(r"\s*#+\s+(.*)", line)
            if m:
                return m.group(1).strip()[:max_len]
    if lang == "python":
        t = text.lstrip()
        if t.startswith(('"""', "'''")):
            q = t[:3]
            end = t.find(q, 3)
            if end != -1:
                first = t[3:end].strip().splitlines()[:1]
                if first:
                    return first[0][:max_len]
        funcs = len(re.findall(r"^\s*def\s+\w+\(", text, flags=re.MULTILINE))
        classes = len(re.findall(r"^\s*class\s+\w+\(", text, flags=re.MULTILINE))
        return (f"Python module with {funcs} functions and {classes} classes.")[:max_len]
    for line in text.splitlines():
        if line.strip():
            return line.strip()[:max_len]
    return ""


def demote_markdown_headings(text, levels=3):
    if levels <= 0:
        return text
    out = []
    for line in text.splitlines():
        m = re.match(r"(\s*)(#+)\s*(.*)$", line)
        if m:
            lead, hashes, rest = m.groups()
            out.append(f"{lead}{'#' * (len(hashes) + levels)} {rest}")
        else:
            out.append(line)
    return "\n".join(out)


def _natural_key(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.findall(r"\d+|\D+", str(s))]


def build_tree(root, files):
    rel_files = [Path(p).relative_to(root) for p in files]

    dir_children_dirs = {}  # parent_dir -> set(child_dir)
    dir_children_files = {}  # parent_dir -> list(child_file)

    def ensure_dir(d):
        if d not in dir_children_dirs:
            dir_children_dirs[d] = set()
        if d not in dir_children_files:
            dir_children_files[d] = []

    ensure_dir(Path("."))

    for rf in rel_files:
        parent = rf.parent
        while True:
            ensure_dir(parent)
            if parent == Path("."):
                break
            parent = parent.parent

        parent = rf.parent
        ensure_dir(parent)
        cur = rf.parent
        while cur != Path("."):
            dir_children_dirs[cur.parent].add(cur)
            cur = cur.parent
        if rf.name:
            if any(str(rf).startswith(str(d) + os.sep) for d in rel_files if d != rf):
                dir_children_dirs[rf.parent].add(rf)
            else:
                dir_children_files[rf.parent].append(rf)

    lines = [str(root.name) + "/"]

    def emit(dirpath, prefix=""):
        subdirs = sorted(dir_children_dirs.get(dirpath, []), key=_natural_key)
        subfiles = sorted(dir_children_files.get(dirpath, []), key=_natural_key)

        total = len(subdirs) + len(subfiles)
        for i, d in enumerate(subdirs):
            is_last = (i == total - 1) if not subfiles else False
            branch = "└── " if is_last else "├── "
            lines.append(prefix + branch + d.name + "/")
            next_prefix = prefix + ("    " if is_last else "│   ")
            emit(d, next_prefix)

        for j, f in enumerate(subfiles):
            is_last = j == len(subfiles) - 1
            if not subdirs:
                is_last = j == len(subfiles) - 1
            branch = "└── " if (subdirs == [] and is_last) else ("└── " if is_last else "├── ")
            lines.append(prefix + branch + f.name)

    emit(Path("."))
    return "```\n" + "\n".join(lines) + "\n```"


def slugify(path_like):
    s = re.sub(r"[^A-Za-z0-9/_\-.]+", "-", path_like)
    s = s.strip("-").replace("/", "-")
    return s or "file"


def detect_dependencies(root):
    deps = {}
    req = root / "requirements.txt"
    if req.exists():
        try:
            pkgs = []
            txt = req.read_text(encoding="utf-8", errors="ignore")
            for line in txt.splitlines():
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                pkgs.append(line)
            if pkgs:
                deps["python_requirements"] = pkgs
        except Exception:
            pass
    pyp = root / "pyproject.toml"
    if pyp.exists():
        try:
            txt = pyp.read_text(encoding="utf-8", errors="ignore")
            m = re.findall(r'(?m)^\s*([A-Za-z0-9_.-]+)\s*=\s*["\']?([^"\']+)["\']?', txt)
            if m:
                deps["pyproject_toml_preview"] = [f"{k}={v}" for k, v in m][:50]
        except Exception:
            pass
    pkg = root / "package.json"
    if pkg.exists():
        try:
            obj = json.loads(pkg.read_text(encoding="utf-8", errors="ignore"))
            for k in ("dependencies", "devDependencies", "peerDependencies"):
                if k in obj and isinstance(obj[k], dict) and obj[k]:
                    deps[f"npm_{k}"] = [f"{n}@{v}" for n, v in obj[k].items()]
        except Exception:
            pass
    return deps


def python_imports(text):
    mods = set()
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"from\s+([a-zA-Z0-9_\.]+)\s+import\s+", line)
        if m:
            mods.add(m.group(1).split(".")[0])
            continue
        m = re.match(r"import\s+([a-zA-Z0-9_\.]+)", line)
        if m:
            first = m.group(1).split(",")[0].strip()
            mods.add(first.split(".")[0])
    return mods


def simple_cyclomatic_complexity_py(text):
    keywords = r"\b(if|elif|for|while|and|or|try|except|with|case)\b"
    return 1 + len(re.findall(keywords, text))


# -------------------------------------------------------------------
# Main
# -------------------------------------------------------------------


def main():
    args = parse_args()

    out_path = Path(args.output).resolve()
    root = Path(args.root).resolve()

    if not root.exists() or not root.is_dir():
        print(f"[ERROR] Root not found or not a directory: {root}", file=sys.stderr)
        return 2

    # Avoid exporting ourselves into the output (dynamic ignore)
    dyn_ignores = []
    if out_path.is_absolute():
        try:
            if out_path == root or root in out_path.parents:
                dyn_ignores.append(str(out_path.relative_to(root)))
        except Exception:
            pass

    this_script = Path(__file__).resolve()
    this_script_name = this_script.name
    try:
        this_script_rel = str(this_script.relative_to(root)).replace(os.sep, "/")
        self_ignores = [this_script_rel, this_script_name]
    except ValueError:
        self_ignores = [this_script_name]

    ignore_patterns = norm_patterns(DEFAULT_IGNORES + self_ignores + args.ignore + dyn_ignores)

    files = []
    # Crucial: topdown=True so pruning affects traversal
    for dirpath, dirnames, filenames in os.walk(root, topdown=True, followlinks=False):
        dp = Path(dirpath)
        rel_dir = rel_str(root, dp)  # "" or "src" etc.

        # --- prune subdirectories BEFORE descending ---
        pruned = []
        for d in dirnames:
            rel_d = f"{rel_dir}/{d}" if rel_dir else d
            if matches_ignore(root, rel_d, ignore_patterns):
                continue
            if args.exclude_hidden and d.startswith("."):
                continue
            pruned.append(d)
        dirnames[:] = pruned  # in-place pruning

        # --- now handle current directory's files ---
        for fn in filenames:
            p = dp / fn
            rel = rel_str(root, p)
            if matches_ignore(root, rel, ignore_patterns):
                continue
            if args.exclude_hidden and fn.startswith("."):
                continue
            if p.is_dir():
                continue  # normally filenames has no dirs, but keep safe
            if has_report_tag_head(p, args.report_tag):
                continue
            if args.only_ext and (p.suffix not in args.only_ext and p.name != "Dockerfile"):
                continue
            files.append(p)

    # Collect per-file info
    total_bytes = 0
    lang_counter = Counter()
    file_records = []
    py_import_graph = defaultdict(set)

    for p in files:
        lang = detect_language(p)
        text, truncated, nbytes = read_text_safely(p, args.max_bytes_per_file)
        total_bytes += nbytes
        lang_counter[lang or "plain"] += 1

        loc = len(text.splitlines()) if text else 0
        sloc = sloc_of_text(text, lang) if text else 0
        todos = count_todos(text) if text else 0
        mtime = datetime.fromtimestamp(p.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")
        digest = sha1_of_text(text) if text else ""

        py_funcs = py_classes = py_complex = 0
        if lang == "python" and text:
            try:
                tree = ast.parse(text)
                py_funcs = sum(isinstance(n, ast.FunctionDef) for n in ast.walk(tree))
                py_classes = sum(isinstance(n, ast.ClassDef) for n in ast.walk(tree))
            except Exception:
                pass
            py_complex = simple_cyclomatic_complexity_py(text)

        rec = {
            "path": p.relative_to(root),
            "lang": lang,
            "text": text,
            "truncated": truncated,
            "nbytes": nbytes,
            "loc": loc,
            "sloc": sloc,
            "todos": todos,
            "mtime": mtime,
            "sha1": digest,
            "py_funcs": py_funcs,
            "py_classes": py_classes,
            "py_complex": py_complex,
        }
        file_records.append(rec)

        if lang == "python" and text:
            imports = python_imports(text)
            if imports:
                rel_key = str(p.relative_to(root))
                py_import_graph[rel_key].update(imports)

    file_records.sort(key=lambda r: str(r["path"]).lower())

    # Overview
    deps = detect_dependencies(root)
    largest = sorted(file_records, key=lambda r: r["nbytes"], reverse=True)[: args.top_n_largest]
    longest = sorted(file_records, key=lambda r: r["loc"], reverse=True)[: args.top_n_largest]
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    total_loc = sum(r["loc"] for r in file_records)
    total_sloc = sum(r["sloc"] for r in file_records)
    total_todos = sum(r["todos"] for r in file_records)

    # Compose Markdown
    lines = []
    lines.append(args.report_tag)
    lines.append(f"<!-- GENERATED at {now} -->")
    title = args.title or f"Project Export: {root.name}"
    lines.append(f"# {title}\n")
    lines.append("## Overview\n")
    lines.append(f"- Root: `{root}`")
    lines.append(f"- Files: **{len(file_records)}**")
    lines.append(f"- Total size: **{total_bytes} bytes**")
    if args.with_metrics:
        lines.append(f"- Total LOC: {total_loc} | SLOC: {total_sloc} | TODOs: {total_todos}")
    lines.append("")

    if lang_counter:
        lines.append("### Language mix")
        for lang, count in lang_counter.most_common():
            lines.append(f"- {lang or '(plain)'}: {count}")
        lines.append("")

    if deps:
        lines.append("### Detected dependencies (best-effort)")
        for k, arr in deps.items():
            lines.append(f"- **{k}** ({len(arr)}):")
            for x in arr[:50]:
                lines.append(f"  - {x}")
            if len(arr) > 50:
                lines.append("  - ...")
        lines.append("")

    if largest:
        lines.append(f"### Top {len(largest)} largest files (bytes)")
        for r in largest:
            lines.append(f"- `{r['path']}` — {r['nbytes']} bytes")
        lines.append("")
    if longest:
        lines.append(f"### Top {len(longest)} longest files (LOC)")
        for r in longest:
            lines.append(f"- `{r['path']}` — {r['loc']} LOC")
        lines.append("")

    lines.append("### Project tree (included subset)")
    lines.append(build_tree(root, [root / r["path"] for r in file_records]))
    lines.append("")

    lines.append("## Table of contents (files)\n")
    for idx, r in enumerate(file_records, start=1):
        anchor = slugify(str(r["path"]))
        lines.append(f"- {idx}. [{r['path']}](#{anchor})")
    lines.append("")

    if args.mermaid_import_graph and py_import_graph:
        lines.append("## Python import graph (naive)\n")
        lines.append("```mermaid")
        lines.append("graph LR")
        for file_path, imports in py_import_graph.items():
            file_path_str = str(file_path)
            file_node = slugify(file_path_str)
            for mod in sorted(imports):
                mod_node = slugify(f"mod-{mod}")
                lines.append(f'  {file_node}["{file_path_str}"] --> {mod_node}["{mod}"]')
        lines.append("```")
        lines.append("")

    lines.append("---\n")
    lines.append("## Files\n")
    for i, r in enumerate(file_records, start=1):
        rel = str(r["path"])
        anchor = slugify(rel)
        lang = r["lang"]
        text = r["text"]
        truncated = r["truncated"]
        nbytes = r["nbytes"]

        lines.append(f'<a id="{anchor}"></a>')
        lines.append(f"### {i}. `{rel}`")
        if args.with_metrics:
            meta = [
                f"Size: {nbytes} bytes",
                f"LOC: {r['loc']}",
                f"SLOC: {r['sloc']}",
                f"TODOs: {r['todos']}",
                f"Modified: {r['mtime']}",
                f"SHA1: {str(r['sha1'])[:12]}",
            ]
            if lang == "python":
                meta.append(
                    f"Py: funcs={r['py_funcs']} \
                      classes={r['py_classes']} \
                      complexity≈{r['py_complex']}"
                )
            lines.append("- " + " | ".join(meta))
        else:
            lines.append(f"- Size: {nbytes} bytes")

        if text:
            brief = extract_brief_description(text, lang)
            if brief:
                lines.append("\n#### Brief")
                lines.append(brief)
            if args.with_summaries:
                s = auto_summary(text, lang)
                if s:
                    lines.append("\n#### Auto Summary")
                    lines.append(s)
            lines.append("")

        if lang == "markdown":
            if args.md_policy == "skip":
                lines.append("_Skipped per --md-policy=skip_")
                lines.append("")
                continue
            elif args.md_policy == "fence":
                lines.append("#### Content (verbatim)\n")
                lines.append("```markdown")
                lines.append((text or "").rstrip())
                if truncated:
                    lines.append("\n<!-- [TRUNCATED due to max-bytes-per-file] -->")
                lines.append("```")
                lines.append("")
                continue
            elif args.md_policy == "render":
                lines.append("#### Content (rendered, headings demoted)\n")
                demoted = demote_markdown_headings(text or "", levels=3)
                lines.append(demoted.rstrip())
                if truncated:
                    lines.append("\n<!-- [TRUNCATED due to max-bytes-per-file] -->")
                lines.append("")
                continue

        lines.append("#### Content\n")
        fence_lang = (lang or "").strip()
        lines.append(f"```{fence_lang}".rstrip())
        if text:
            lines.append(text.rstrip())
        if truncated:
            lines.append("\n# [TRUNCATED due to max-bytes-per-file]")
        lines.append("```")
        lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[OK] Wrote: {out_path}")
    return 0


if __name__ == "__main__":
    main()
