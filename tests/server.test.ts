import test from "node:test";
import assert from "node:assert/strict";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CallToolResultSchema, ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";

import { RelivioApiClient } from "../src/client/relivio-api.js";
import { buildMcpServer } from "../src/server.js";

test("MCP server registers get_verdict and returns structured ready content", async () => {
  const clientAdapter = {
    getLatestSummary: async () => ({
      id: "sum_1",
      deployment_id: "dep_1",
      verdict: "WATCH",
      confidence: "HIGH",
      recommended_action: "Keep guard ready and continue observation",
      recommended_action_detail: "Inspect /api/orders/finalize before wider rollout",
      decision_tier: "guard_ready",
      affected_apis: ["/api/orders/finalize"],
      top_signals: ["route concentration"],
      created_at: "2026-04-20T12:00:00Z",
    }),
  } as unknown as RelivioApiClient;
  const server = buildMcpServer(clientAdapter);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({
    name: "relivio-mcp-test-client",
    version: "0.1.0",
  });

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  const tools = await client.request({ method: "tools/list", params: {} }, ListToolsResultSchema);
  assert.equal(tools.tools.length, 1);
  assert.equal(tools.tools[0]?.name, "get_verdict");

  const result = await client.request(
    {
      method: "tools/call",
      params: {
        name: "get_verdict",
        arguments: {},
      },
    },
    CallToolResultSchema,
  );

  assert.equal(result.isError ?? false, false);
  assert.deepEqual(result.structuredContent, {
    status: "ready",
    verdict: {
      verdict: "WATCH",
      decision_tier: "guard_ready",
      recommended_action: "Keep guard ready and continue observation",
      action_detail: "Inspect /api/orders/finalize before wider rollout",
      affected_apis: ["/api/orders/finalize"],
      top_signals: ["route concentration"],
      deployment_id: "dep_1",
      created_at: "2026-04-20T12:00:00Z",
    },
  });

  await Promise.all([client.close(), server.close()]);
});
