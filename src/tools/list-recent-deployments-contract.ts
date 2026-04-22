import { z } from "zod";

import type { ListRecentDeploymentsResult } from "../types.js";

export const listRecentDeploymentsOutputSchema = {
  status: z.enum(["ready", "error"]),
  deployments: z
    .array(
      z.object({
        deployment_id: z.string(),
        version: z.string().nullable(),
        deployed_at: z.string(),
        window_status: z.string(),
      }),
    )
    .optional(),
  reason: z.enum(["authentication_failed", "server_unavailable"]).optional(),
  message: z.string().optional(),
};

export type ListRecentDeploymentsStructuredContent = {
  [key: string]: unknown;
  status: "ready" | "error";
  deployments?: Array<{
    [key: string]: unknown;
    deployment_id: string;
    version: string | null;
    deployed_at: string;
    window_status: string;
  }>;
  reason?: "authentication_failed" | "server_unavailable";
  message?: string;
};

export function toListRecentDeploymentsStructuredContent(
  result: ListRecentDeploymentsResult,
): ListRecentDeploymentsStructuredContent {
  if (result.status === "ready") {
    return {
      status: "ready",
      deployments: result.deployments.map((deployment) => ({
        deployment_id: deployment.deployment_id,
        version: deployment.version,
        deployed_at: deployment.deployed_at,
        window_status: deployment.window_status,
      })),
    };
  }

  return {
    status: "error",
    reason: result.reason,
    message: result.message,
  };
}
