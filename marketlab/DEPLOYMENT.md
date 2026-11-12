# Deployment guide

## Web dashboard (Vercel)

1. Import `CurentLeaf/codex-trading-skills` in Vercel.
2. Set **Root Directory** to `marketlab`; framework **Next.js**.
3. Set `ALPHAVANTAGE_API_KEY` as a server-only environment variable if using provider quotes. Never use `NEXT_PUBLIC_` for secrets.
4. Deploy, then test `/api/quote`, `/api/research` and `/api/skills`.

The skill catalog reads files from `../.agents/skills` at runtime. Some hosting providers bundle only the app root. If the catalog is empty or inaccessible in production, configure the build to include that folder or deploy the web app as a full-repository container. Do not assume it works without verifying.

## ChatGPT MCP (separate service)

The read-only MCP server is a separate Node process. For local testing: `node mcp/server.mjs` in `marketlab`.

For production, deploy a container using `marketlab/Dockerfile` with **repository root as Docker build context**. Provide `ALPHAVANTAGE_API_KEY` securely. Publish only over HTTPS.

**DO NOT deploy this MCP server publicly as-is:** it has no user authentication, access control or rate limiting. Before exposing it, add OAuth or another supported authentication mechanism, rate limits, request timeouts, session storage and monitoring. Then connect its HTTPS `/mcp` endpoint in ChatGPT's supported custom MCP plugin setup. Connection and permission approval require the account owner.

The ChatGPT connection is not created merely by pushing GitHub code.

## Scope

No real orders, broker credentials, brokerage APIs or execution tools. Historical data is delayed/end-of-day. Paper portfolio remains browser-local, and will not synchronize across devices. Skill catalog is a read-only library, not an AI agent executing imported scripts.

## Verification

Run `npm install && npm audit --audit-level=moderate && npm test && npm run build` inside `marketlab` and check GitHub Actions.
