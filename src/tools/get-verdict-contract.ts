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
      rationale_summary: z.string(),
      operator_steps: z.array(z.record(z.string(), z.unknown())),
      protection_guidance: z.record(z.string(), z.unknown()).nullable(),
      affected_apis: z.array(z.string()),
      top_signals: z.array(z.string()),
      delivery_status: z.enum(["ready", "held"]),
      delivery_hold_reason: z.string().nullable(),
      external_delivery_ready: z.boolean(),
      agent_ready: z.boolean(),
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
    rationale_summary: string;
    operator_steps: Array<Record<string, unknown>>;
    protection_guidance: Record<string, unknown> | null;
    affected_apis: string[];
    top_signals: string[];
    delivery_status: "ready" | "held";
    delivery_hold_reason: string | null;
    external_delivery_ready: boolean;
    agent_ready: boolean;
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
        rationale_summary: result.verdict.rationale_summary,
        operator_steps: result.verdict.operator_steps.map((step) => ({ ...step })),
        protection_guidance:
          result.verdict.protection_guidance === null
            ? null
            : { ...result.verdict.protection_guidance },
        affected_apis: [...result.verdict.affected_apis],
        top_signals: [...result.verdict.top_signals],
        delivery_status: result.verdict.delivery_status,
        delivery_hold_reason: result.verdict.delivery_hold_reason,
        external_delivery_ready: result.verdict.external_delivery_ready,
        agent_ready: result.verdict.agent_ready,
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
