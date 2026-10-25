import type { OperationResult } from "../types/operationResult";
import { createApiKeyAuthHeaders } from "./apiKeyAuth";

const API_KEY_STORAGE_KEY = "monkeytype-stats-api-key";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized — check your API key.");
  }
}

function readStoredApiKey(): string | null {
  try {
    return sessionStorage.getItem(API_KEY_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Asks for the API key once per browser tab and remembers it in sessionStorage,
 * so editing goals and views doesn't prompt on every save.
 */
export function requestApiKey(action: string): string | null {
  const stored = readStoredApiKey();
  if (stored) return stored;
  const apiKey = window.prompt(`Enter API key to ${action}:`);
  if (!apiKey) return null;
  try {
    sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  } catch {
    // storage unavailable; the key just isn't remembered
  }
  return apiKey;
}

/** Runs a write with the API key, asking for it first if this tab doesn't have it yet. */
export function withApiKey<T>(action: string, run: (apiKey: string) => Promise<T>): Promise<T> {
  const apiKey = requestApiKey(action);
  if (!apiKey) return Promise.reject(new Error("An API key is required to save changes."));
  return run(apiKey);
}

export function forgetApiKey() {
  try {
    sessionStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch {
    // nothing to forget
  }
}

/** Fetches an OperationResult endpoint and returns its data, throwing on any error. */
export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; apiKey?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.apiKey) Object.assign(headers, createApiKeyAuthHeaders(options.apiKey));

  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401) {
    forgetApiKey();
    throw new UnauthorizedError();
  }

  let payload: OperationResult<T> | null = null;
  try {
    payload = (await response.json()) as OperationResult<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.isValid === false) {
    throw new Error(payload?.errors?.join(" ") || `Request failed: ${response.statusText}`);
  }

  return payload?.data as T;
}
