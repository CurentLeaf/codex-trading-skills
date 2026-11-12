#!/usr/bin/env python3
"""Import Claude Trading Skills into Codex's .agents/skills directory.

Requires Python 3.11+ and Git. Does not install dependencies or execute imported scripts.
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://github.com/tradermonty/claude-trading-skills.git"
SKILL_ROOT = ROOT / ".agents" / "skills"
COPY_ITEMS = ("workflows", "skillsets", "skills-index.yaml")


def rewrite_skill(content: str) -> str:
    # Rewrite root-relative script/reference paths, without touching URLs.
    content = re.sub(r"(?<![\w./-])skills/([a-zA-Z0-9_-]+/)", r".agents/skills/\1", content)
    note = (
        "\n\n## Codex compatibility notes\n\n"
        "- Run commands from the repository root.\n"
        "- Imported scripts and dependencies are not audited; review before executing.\n"
        "- Claude-specific tool, slash-command, subagent and hook references may require manual adaptation.\n"
        "- Do not execute live broker orders or change external account state.\n"
    )
    return content + note


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ref", default="main", help="Upstream branch or tag")
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix="codex-trading-") as tmp:
        source = Path(tmp) / "upstream"
        subprocess.run(["git", "clone", "--depth", "1", "--branch", args.ref, SOURCE, str(source)], check=True)
        source_skills = source / "skills"
        if not source_skills.is_dir():
            raise RuntimeError("Upstream skills directory not found")
        SKILL_ROOT.mkdir(parents=True, exist_ok=True)
        imported = 0
        for directory in sorted(source_skills.iterdir()):
            if not directory.is_dir() or not (directory / "SKILL.md").exists():
                continue
            dest = SKILL_ROOT / directory.name
            if dest.exists():
                shutil.rmtree(dest)
            shutil.copytree(directory, dest, ignore=shutil.ignore_patterns("__pycache__", ".pytest_cache", "*.pyc"))
            skill_md = dest / "SKILL.md"
            skill_md.write_text(rewrite_skill(skill_md.read_text(encoding="utf-8")), encoding="utf-8")
            imported += 1
        for name in COPY_ITEMS:
            src = source / name
            dst = ROOT / name
            if not src.exists():
                continue
            if dst.is_dir():
                shutil.rmtree(dst)
            elif dst.exists():
                dst.unlink()
            if src.is_dir():
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)
        license_path = ROOT / "upstream" / "LICENSE"
        license_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source / "LICENSE", license_path)
        (ROOT / "upstream" / "SOURCE_COMMIT").write_text(
            subprocess.check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True).strip() + "\n",
            encoding="utf-8",
        )
        print(f"Imported {imported} Codex skills from {SOURCE} at {args.ref}")


if __name__ == "__main__":
    main()
