import type { SummaryResponse } from "../types.js";

export class RelivioApiHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseText: string,
  ) {
    super(message);
    this.name = "RelivioApiHttpError";
  }
}

export interface RelivioApiClientOptions {
  apiUrl: string;
  apiKey: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export class RelivioApiClient {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor({
    apiUrl,
    apiKey,
    timeoutMs = 10_000,
    fetchImpl = fetch,
  }: RelivioApiClientOptions) {
    this.apiUrl = apiUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
    this.fetchImpl = fetchImpl;
  }

  async getLatestSummary(deploymentId?: string): Promise<SummaryResponse> {
    const url = new URL(`${this.apiUrl}/api/v1/summaries/latest`);
    if (deploymentId) {
      url.searchParams.set("deployment_id", deploymentId);
    }

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-API-Key": this.apiKey,
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      throw new RelivioApiHttpError(
        error instanceof Error ? error.message : "Relivio request failed.",
        503,
        "",
      );
    }

    const responseText = await response.text();
    if (!response.ok) {
      throw new RelivioApiHttpError(
        `Relivio API request failed with status ${response.status}.`,
        response.status,
        responseText,
      );
    }

    const parsed = parseSummaryResponse(responseText);
    return parsed;
  }
}

function parseSummaryResponse(raw: string): SummaryResponse {
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error("Relivio API returned invalid JSON.");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Relivio API returned an invalid summary payload.");
  }

  const record = payload as Record<string, unknown>;
  const deploymentId = asString(record.deployment_id, "deployment_id");
  const createdAt = asString(record.created_at, "created_at");
  const verdict = asNullableString(record.verdict);
  const confidence = asNullableString(record.confidence);
  const recommendedAction = asNullableString(record.recommended_action);
  const recommendedActionDetail = asNullableString(record.recommended_action_detail);
  const decisionTier = asNullableString(record.decision_tier);

  return {
    id: asString(record.id, "id"),
    deployment_id: deploymentId,
    verdict,
    confidence,
    recommended_action: recommendedAction,
    recommended_action_detail: recommendedActionDetail,
    decision_tier: decisionTier as SummaryResponse["decision_tier"],
    affected_apis: asStringArray(record.affected_apis),
    top_signals: asStringArray(record.top_signals),
    created_at: createdAt,
  };
}

function asString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Relivio API payload is missing ${fieldName}.`);
  }
  return value;
}

function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === "string" ? value : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === "string");
}
