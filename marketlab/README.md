# MarketLab AI MVP

Two interfaces over a shared read-only market research adapter:

- **Web:** Next.js dashboard with ticker lookup and a browser-local paper portfolio.
- **ChatGPT:** MCP server at `/mcp` exposing read-only market quotes and hypothetical position sizing.

## Run website

```bash
cd marketlab
npm install
npm run dev
```

Open http://localhost:3000. Without an API key, only **explicitly labeled fictional demo quotes** are displayed. Paper entries are disabled for demo quotes.

To enable provider quotes, copy `.env.example` to `.env.local` and set `ALPHAVANTAGE_API_KEY`. Restart the server. Alpha Vantage's GLOBAL_QUOTE can be delayed/end-of-day depending on plan; this is **not streaming live data**.

Paper journal entries are saved in the browser's localStorage, not in a cloud database. Clearing browser data removes them. Simulated fills use quoted prices without fees or slippage. Do not treat simulated results as actual achievable returns.

## Run ChatGPT MCP server

```bash
cd marketlab
npm install
node mcp/server.mjs
```

The MCP endpoint listens at http://localhost:8787/mcp. For ChatGPT, deploy it behind HTTPS or use a secure development tunnel, then add the remote `/mcp` URL as a custom plugin where your account/workspace permits. The MCP server exposes **read-only** tools `get_market_quote` and `calculate_hypothetical_position`. It does not expose order placement or paper portfolio writes.

**Security:** This MVP MCP endpoint has no authentication and is intended for local development only. Do not publish it as an unrestricted public service. Add authentication, rate limits and user isolation before deployment. See [official MCP plugin quickstart](https://developers.openai.com/plugins/build/app-quickstart).

## Architecture

```text
Browser -> Next.js /api/quote -> shared market adapter -> Alpha Vantage (optional)
Browser -> localStorage (paper journal, no broker)
ChatGPT -> remote MCP /mcp -> shared market adapter
Codex -> .agents/skills/ (74 upstream research skills)
```

The imported 74 Codex skills are **not yet connected to the web app or MCP tools**. No AI model is called by the MVP; the name reflects the intended roadmap. Later phases: authenticated users, historical chart data, skill execution sandbox, research reports, shared persistent paper portfolio, and scheduled monitoring.

## Tests

`npm test` validates symbol input, quote parsing, demo labeling and hypothetical position sizing.
