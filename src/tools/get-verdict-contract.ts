import { z } from "zod";

import type { GetVerdictResult } from "../types.js";

export const getVerdictOutputSchema = {
  status: z.enum(["ready", "pending", "error"]),
  verdict: z
    .object({
      verdict: z.string(),
      decision_tier: z.enum([
        "inform",
        "observe",
        "guard_ready",
        "rollback_ready",
        "block_recommended",
      ]),
      recommended_action: z.string(),
      action_detail: z.string(),
      affected_apis: z.array(z.string()),
      top_signals: z.array(z.string()),
      deployment_id: z.string(),
      created_at: z.string(),
    })
    .optional(),
  reason: z.enum(["observation_window_active", "authentication_failed", "server_unavailable"]).optional(),
  message: z.string().optional(),
  retry_after_hint_minutes: z.number().int().positive().optional(),
};

export type GetVerdictStructuredContent = {
  [key: string]: unknown;
  status: "ready" | "pending" | "error";
  verdict?: {
    [key: string]: unknown;
    verdict: string;
    decision_tier: "inform" | "observe" | "guard_ready" | "rollback_ready" | "block_recommended";
    recommended_action: string;
    action_detail: string;
    affected_apis: string[];
    top_signals: string[];
    deployment_id: string;
    created_at: string;
  };
  reason?: "observation_window_active" | "authentication_failed" | "server_unavailable";
  message?: string;
  retry_after_hint_minutes?: number;
};

export function toGetVerdictStructuredContent(
  result: GetVerdictResult,
): GetVerdictStructuredContent {
  if (result.status === "ready") {
    return {
      status: "ready",
      verdict: {
        verdict: result.verdict.verdict,
        decision_tier: result.verdict.decision_tier,
        recommended_action: result.verdict.recommended_action,
        action_detail: result.verdict.action_detail,
        affected_apis: [...result.verdict.affected_apis],
        top_signals: [...result.verdict.top_signals],
        deployment_id: result.verdict.deployment_id,
        created_at: result.verdict.created_at,
      },
    };
  }

  if (result.status === "pending") {
    return {
      status: "pending",
      reason: result.reason,
      message: result.message,
      retry_after_hint_minutes: result.retry_after_hint_minutes,
    };
  }

  return {
    status: "error",
    reason: result.reason,
    message: result.message,
  };
}
