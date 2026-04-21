# relivio-mcp

## Purpose

Expose Relivio verdicts to AI coding agents through a minimal MCP server.

## Stack

- TypeScript
- Node.js
- `@modelcontextprotocol/sdk`

## Core rules

- Thin wrapper only
- No new business logic
- No relivio-server runtime contract changes
- Keep output action-first and structured

## Commands

- `npm install`
- `npm run build`
- `npm run test`
- `npm run start`
