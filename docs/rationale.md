# relivio-mcp v0 rationale

## Problem

Relivio already produces deploy-time verdicts, but agents cannot consume that verdict through a dedicated surface.

## Direction

v0 stays intentionally narrow:

- two read-only tools:
  - `get_verdict`
  - `list_recent_deployments`
- thin wrapper over `relivio-server`
- no write path
- no new decision logic

The MCP layer is a consumer surface, not a second decision engine.

## Current scope

- latest verdict lookup
- specific deployment verdict lookup
- structured `ready / pending / error` response
- action-first output (`recommended_action` stays primary)

## Explicit non-goals

- deployment registration
- ingest submission
- feedback submission
- extra prose surface such as `summary_line`
- multi-project routing beyond API-key scope
