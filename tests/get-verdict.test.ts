import test from "node:test";
import assert from "node:assert/strict";

import { RelivioApiClient, RelivioApiHttpError } from "../src/client/relivio-api.js";
import { createGetVerdictTool } from "../src/tools/get-verdict.js";

function stubClient(handler: () => Promise<unknown>): RelivioApiClient {
  return {
    getLatestSummary: handler,
  } as unknown as RelivioApiClient;
}

test("get_verdict returns ready payload", async () => {
  const tool = createGetVerdictTool(
    stubClient(async () => ({
      id: "sum_1",
      deployment_id: "dep_1",
      verdict: "RISK",
      confidence: "HIGH",
      recommended_action: "Pause rollout and start rollback review",
      recommended_action_detail: "Inspect /api/orders/finalize first",
      decision_tier: "block_recommended",
      affected_apis: ["/api/orders/finalize"],
      top_signals: ["orders primary saturation"],
      created_at: "2026-04-20T12:00:00Z",
    })),
  );

  const result = await tool.handler({});
  assert.equal(result.status, "ready");
  if (result.status === "ready") {
    assert.equal(result.verdict.decision_tier, "block_recommended");
    assert.equal(result.verdict.recommended_action, "Pause rollout and start rollback review");
  }
});

test("get_verdict maps 404 to pending", async () => {
  const tool = createGetVerdictTool(
    stubClient(async () => {
      throw new RelivioApiHttpError("not ready", 404, "");
    }),
  );

  const result = await tool.handler({});
  assert.deepEqual(result, {
    status: "pending",
    reason: "observation_window_active",
    message: "No verdict yet. The observation window is still active.",
    retry_after_hint_minutes: 15,
  });
});

test("get_verdict maps 401 to authentication_failed", async () => {
  const tool = createGetVerdictTool(
    stubClient(async () => {
      throw new RelivioApiHttpError("unauthorized", 401, "");
    }),
  );

  const result = await tool.handler({});
  assert.deepEqual(result, {
    status: "error",
    reason: "authentication_failed",
    message: "Check RELIVIO_API_KEY configuration.",
  });
});

test("get_verdict maps other failures to server_unavailable", async () => {
  const tool = createGetVerdictTool(
    stubClient(async () => {
      throw new Error("timeout");
    }),
  );

  const result = await tool.handler({});
  assert.deepEqual(result, {
    status: "error",
    reason: "server_unavailable",
    message: "timeout",
  });
});
