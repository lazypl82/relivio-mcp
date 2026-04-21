import { z } from "zod";

import { RelivioApiClient, RelivioApiHttpError } from "../client/relivio-api.js";
import type { GetVerdictResult, SummaryResponse, VerdictResult } from "../types.js";

const OBSERVATION_WINDOW_HINT_MINUTES = 15;

export const getVerdictInputSchema = {
  deployment_id: z.string().min(1).optional(),
};

export interface GetVerdictToolDefinition {
  name: "get_verdict";
  description: string;
  inputSchema: typeof getVerdictInputSchema;
  annotations: {
    readOnlyHint: true;
    openWorldHint: false;
  };
  handler: (input: { deployment_id?: string }) => Promise<GetVerdictResult>;
}

export function createGetVerdictTool(client: RelivioApiClient): GetVerdictToolDefinition {
  return {
    name: "get_verdict",
    description:
      "Get the post-deploy verdict with the recommended next action. " +
      "Returns verdict, decision tier, and a concrete recommended action so you know what to do now. " +
      "Call before making code changes or after a deploy to decide your next step.",
    inputSchema: getVerdictInputSchema,
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
    },
    handler: async ({ deployment_id }) => {
      try {
        const summary = await client.getLatestSummary(deployment_id);
        return {
          status: "ready",
          verdict: mapSummaryToVerdict(summary),
        };
      } catch (error) {
        return mapClientError(error);
      }
    },
  };
}

function mapSummaryToVerdict(summary: SummaryResponse): VerdictResult {
  if (!summary.verdict) {
    throw new Error("Relivio summary is missing verdict.");
  }
  if (!summary.decision_tier) {
    throw new Error("Relivio summary is missing decision_tier.");
  }
  if (!summary.recommended_action) {
    throw new Error("Relivio summary is missing recommended_action.");
  }

  return {
    verdict: summary.verdict,
    decision_tier: summary.decision_tier,
    recommended_action: summary.recommended_action,
    action_detail: summary.recommended_action_detail ?? "",
    affected_apis: summary.affected_apis,
    top_signals: summary.top_signals,
    deployment_id: summary.deployment_id,
    created_at: summary.created_at,
  };
}

function mapClientError(error: unknown): GetVerdictResult {
  if (error instanceof RelivioApiHttpError) {
    if (error.status === 404) {
      return {
        status: "pending",
        reason: "observation_window_active",
        message: "No verdict yet. The observation window is still active.",
        retry_after_hint_minutes: OBSERVATION_WINDOW_HINT_MINUTES,
      };
    }
    if (error.status === 401) {
      return {
        status: "error",
        reason: "authentication_failed",
        message: "Check RELIVIO_API_KEY configuration.",
      };
    }
    return {
      status: "error",
      reason: "server_unavailable",
      message: "Relivio server is temporarily unavailable. Retry in a moment.",
    };
  }

  return {
    status: "error",
    reason: "server_unavailable",
    message: error instanceof Error ? error.message : "Relivio server is temporarily unavailable. Retry in a moment.",
  };
}
