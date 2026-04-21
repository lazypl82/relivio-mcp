import test from "node:test";
import assert from "node:assert/strict";

import { RelivioApiClient, RelivioApiHttpError } from "../src/client/relivio-api.js";

test("RelivioApiClient returns parsed summary on 200", async () => {
  const client = new RelivioApiClient({
    apiUrl: "https://api.relivio.dev",
    apiKey: "test-key",
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          id: "sum_1",
          deployment_id: "dep_1",
          verdict: "WATCH",
          confidence: "HIGH",
          recommended_action: "Keep guard ready",
          recommended_action_detail: "Inspect /api/orders/finalize",
          decision_tier: "guard_ready",
          affected_apis: ["/api/orders/finalize"],
          top_signals: ["route concentration"],
          created_at: "2026-04-20T12:00:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
  });

  const summary = await client.getLatestSummary("dep_1");
  assert.equal(summary.deployment_id, "dep_1");
  assert.equal(summary.recommended_action, "Keep guard ready");
  assert.deepEqual(summary.affected_apis, ["/api/orders/finalize"]);
});

test("RelivioApiClient throws status-aware error on 404", async () => {
  const client = new RelivioApiClient({
    apiUrl: "https://api.relivio.dev",
    apiKey: "test-key",
    fetchImpl: async () => new Response(JSON.stringify({ code: "SUMMARY_NOT_READY" }), { status: 404 }),
  });

  await assert.rejects(
    () => client.getLatestSummary(),
    (error: unknown) => error instanceof RelivioApiHttpError && error.status === 404,
  );
});

test("RelivioApiClient throws invalid JSON error on malformed body", async () => {
  const client = new RelivioApiClient({
    apiUrl: "https://api.relivio.dev",
    apiKey: "test-key",
    fetchImpl: async () => new Response("not-json", { status: 200 }),
  });

  await assert.rejects(() => client.getLatestSummary(), /invalid JSON/i);
});
