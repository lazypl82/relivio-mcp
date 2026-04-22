import test from "node:test";
import assert from "node:assert/strict";

import { createListRecentDeploymentsTool } from "../src/tools/list-recent-deployments.js";

test("list_recent_deployments returns ready payload", async () => {
  const tool = createListRecentDeploymentsTool({
    listRecentDeployments: async () => ({
      items: [
        {
          deployment_id: "dep_1",
          version: "v1.2.3",
          deployed_at: "2026-04-22T12:00:00Z",
          window_status: "ACTIVE",
        },
      ],
    }),
  } as never);

  const result = await tool.handler({ limit: 5 });

  assert.deepEqual(result, {
    status: "ready",
    deployments: [
      {
        deployment_id: "dep_1",
        version: "v1.2.3",
        deployed_at: "2026-04-22T12:00:00Z",
        window_status: "ACTIVE",
      },
    ],
  });
});
