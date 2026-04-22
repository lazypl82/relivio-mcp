import { z } from "zod";

import { RelivioApiClient, RelivioApiHttpError } from "../client/relivio-api.js";
import type { ListRecentDeploymentsResult } from "../types.js";

export const listRecentDeploymentsInputSchema = {
  limit: z.number().int().min(1).max(20).optional(),
};

export interface ListRecentDeploymentsToolDefinition {
  name: "list_recent_deployments";
  description: string;
  inputSchema: typeof listRecentDeploymentsInputSchema;
  annotations: {
    readOnlyHint: true;
    openWorldHint: false;
  };
  handler: (input: { limit?: number }) => Promise<ListRecentDeploymentsResult>;
}

export function createListRecentDeploymentsTool(
  client: RelivioApiClient,
): ListRecentDeploymentsToolDefinition {
  return {
    name: "list_recent_deployments",
    description:
      "List recent deployments for the current project API key scope. " +
      "Use this when you need a deployment_id before calling get_verdict for a specific deploy.",
    inputSchema: listRecentDeploymentsInputSchema,
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
    },
    handler: async ({ limit }) => {
      try {
        const response = await client.listRecentDeployments(limit ?? 10);
        return {
          status: "ready",
          deployments: response.items,
        };
      } catch (error) {
        return mapClientError(error);
      }
    },
  };
}

function mapClientError(error: unknown): ListRecentDeploymentsResult {
  if (error instanceof RelivioApiHttpError && error.status === 401) {
    return {
      status: "error",
      reason: "authentication_failed",
      message: "Check RELIVIO_API_KEY configuration.",
    };
  }

  return {
    status: "error",
    reason: "server_unavailable",
    message: error instanceof Error ? error.message : "Relivio server is temporarily unavailable. Retry in a moment.",
  };
}
