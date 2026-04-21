# Security

## Secrets

- Never commit `RELIVIO_API_KEY`
- Keep runtime credentials in local MCP client configuration or environment variables

## Scope

`relivio-mcp` is read-only in v0.

It does not:

- register deployments
- send ingest signals
- submit feedback

## Reporting

If you find a security issue in this repository, open a private report through GitHub Security Advisories if available, or contact the maintainer before publishing details.
