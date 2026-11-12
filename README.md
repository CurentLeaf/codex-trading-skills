# Codex Trading Skills

Codex adaptation of [tradermonty/claude-trading-skills](https://github.com/tradermonty/claude-trading-skills), an MIT-licensed trading research toolkit.

**Research and education only. No live trade execution.** Not financial advice.

## Installation

1. Clone this repository and open its root folder in Codex.
2. Read `AGENTS.md`, then choose a skill under `.agents/skills/`.
3. Ask Codex to use a named skill, e.g. "Use position-sizer to compare hypothetical position-sizing methods."
4. Install only dependencies needed by the selected skill and provide your own permitted data.

## Importing upstream

The GitHub Actions **Import upstream skills** workflow imports the upstream repository into `.agents/skills/`. You can also run `python scripts/sync_upstream.py` locally (requires Python 3.11+ and Git).

The importer preserves skill scripts, references, tests and assets; copies upstream workflows and skillsets; and rewrites root-relative skill paths. Claude-specific agents, hooks, and slash commands are **not** automatically converted. Review imported scripts, integrations, and instructions before running.

## Attribution and safety

Original project: [tradermonty/claude-trading-skills](https://github.com/tradermonty/claude-trading-skills). Upstream license is copied to `upstream/LICENSE`.

Do not commit API keys, connect unreviewed code to brokerage credentials, or enable order execution. Backtests and AI analysis do not guarantee results.
