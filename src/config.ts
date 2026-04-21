export interface RuntimeConfig {
  apiUrl: string;
  apiKey: string;
  timeoutMs: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;

export function loadRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const apiUrl = env.RELIVIO_API_URL?.trim();
  const apiKey = env.RELIVIO_API_KEY?.trim();

  if (!apiUrl) {
    throw new Error("RELIVIO_API_URL is required.");
  }
  if (!apiKey) {
    throw new Error("RELIVIO_API_KEY is required.");
  }

  return {
    apiUrl: apiUrl.replace(/\/+$/, ""),
    apiKey,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };
}
