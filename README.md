# relivio-mcp

Minimal MCP server for consuming Relivio post-deploy verdicts from Claude Code, Codex, and other MCP clients.

`relivio-mcp` is a thin wrapper over `relivio-server`:

- `GET /api/v1/summaries/latest`
- `GET /api/v1/summaries/latest?deployment_id=...`

It does not:

- create deployments
- ingest runtime signals
- add new business logic
- replace Relivio's decision engine

It only exposes the verdict surface that agents need:

- `verdict`
- `decision_tier`
- `recommended_action`
- supporting context for the next move

## Status

Current status: `v0`

- one tool: `get_verdict`
- read-only only
- thin wrapper over the existing Relivio API
- no write tools yet

v0 assumptions:

- one API key maps to one project
- `get_verdict` is the only tool
- `retry_after_hint_minutes` is a server-configured observation window hint, currently surfaced as `15`

## Who this is for

Use this if:

- you already have a Relivio project API key
- you want an agent to check post-deploy status before or after code changes
- you want a read-only verdict surface first, without write tools

Do not use this as:

- a deployment trigger
- an ingest client
- an observability adapter
- an incident automation tool

## Environment

- `RELIVIO_API_URL`
  - Example: `https://api.relivio.dev`
- `RELIVIO_API_KEY`
  - Project-scoped runtime API key

## Quick start

```bash
npm install
npm run build
```

## Install as a package

Global install:

```bash
npm install -g relivio-mcp
```

After that, the executable is:

```bash
relivio-mcp
```

If you do not want a global install, keep using the built file directly from the repo checkout.

## Test

```bash
npm test
```

## Claude Code MCP registration

Use the built entrypoint:

```json
{
  "mcpServers": {
    "relivio": {
      "command": "node",
      "args": ["/absolute/path/to/relivio-mcp/dist/index.js"],
      "env": {
        "RELIVIO_API_URL": "https://api.relivio.dev",
        "RELIVIO_API_KEY": "your-project-api-key"
      }
    }
  }
}
```

The same `command / args / env` shape can be adapted for other MCP-capable clients.

If installed globally from npm, you can use:

```json
{
  "mcpServers": {
    "relivio": {
      "command": "relivio-mcp",
      "env": {
        "RELIVIO_API_URL": "https://api.relivio.dev",
        "RELIVIO_API_KEY": "your-project-api-key"
      }
    }
  }
}
```

## Development

```bash
npm install
npm run build
npm test
npm run pack:check
```

Runtime entrypoint:

```bash
npm run start
```

If `RELIVIO_API_URL` or `RELIVIO_API_KEY` is missing, startup fails immediately with a clear error.

## Tool

### `get_verdict`

Returns the latest verdict for the project, or the verdict for a specific deployment.

Input:

```json
{
  "deployment_id": "optional-deployment-id"
}
```

Ready response:

```json
{
  "status": "ready",
  "verdict": {
    "verdict": "WATCH",
    "decision_tier": "guard_ready",
    "recommended_action": "Keep guard ready and continue observation",
    "action_detail": "Inspect /api/orders/finalize before wider rollout",
    "affected_apis": ["/api/orders/finalize"],
    "top_signals": ["route concentration around /api/orders/finalize"],
    "deployment_id": "dep_123",
    "created_at": "2026-04-20T03:20:00Z"
  }
}
```

Pending response:

```json
{
  "status": "pending",
  "reason": "observation_window_active",
  "message": "No verdict yet. The observation window is still active.",
  "retry_after_hint_minutes": 15
}
```

Error response:

```json
{
  "status": "error",
  "reason": "authentication_failed",
  "message": "Check RELIVIO_API_KEY configuration."
}
```

## Current scope

v0 intentionally stays narrow:

- one tool: `get_verdict`
- read-only surface
- structured `ready / pending / error`

Not included in v0:

- `summary_line`
- deployment registration
- ingest submission
- feedback submission
- multi-project routing beyond API-key scope

## Related repos

- `relivio-server` — verdict producer and summary API
- `relivio-console` — human-facing console surface
- `relivio-sim-lab` — scenario and smoke validation

## Optional integration tip

If you want Claude Code to check verdicts more proactively, add an optional hook to the consuming project's `CLAUDE.md`:

```markdown
Before making code changes, call get_verdict to check production status.
```

This is not required for v0 correctness.

## Security

- Do not commit `RELIVIO_API_KEY`
- Keep API keys in your MCP client environment config only
- This repo is read-only by design in v0

See [SECURITY.md](./SECURITY.md) for reporting guidance.

## Contributing

Small, behavior-preserving pull requests are preferred.

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
