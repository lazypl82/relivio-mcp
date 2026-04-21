# Contributing

## Scope

This repository is intentionally narrow.

Preferred contributions:

- thin-wrapper fixes
- contract clarity
- MCP tool ergonomics
- README / docs consistency
- test coverage for `ready / pending / error`

Avoid broadening scope without a clear decision:

- new business logic
- deploy registration
- ingest submission
- write tools
- extra prose layers that duplicate existing verdict fields

## Development

```bash
npm install
npm run build
npm test
```

## Pull request expectations

- keep one logical change per PR
- keep behavior small and explicit
- update docs when tool semantics change
- include the exact verification commands you ran
