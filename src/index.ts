#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { RelivioApiClient } from "./client/relivio-api.js";
import { loadRuntimeConfig } from "./config.js";
import { buildMcpServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadRuntimeConfig();
  const client = new RelivioApiClient({
    apiUrl: config.apiUrl,
    apiKey: config.apiKey,
    timeoutMs: config.timeoutMs,
  });
  const server = buildMcpServer(client);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error("relivio-mcp startup failed:", error);
  process.exit(1);
});
