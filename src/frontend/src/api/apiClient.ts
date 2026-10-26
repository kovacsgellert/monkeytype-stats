import type { OperationResult } from "../types/operationResult";

export class UnauthorizedError extends Error {
  constructor(message = "Your session has expired. Log in again.") {
    super(message);
  }
}

/** Reads an OperationResult body, or null when the response has none. */
export async function readOperationResult<T>(response: Response): Promise<OperationResult<T> | null> {
  try {
    return (await response.json()) as OperationResult<T>;
  } catch {
    return null;
  }
}

/** Fetches an OperationResult endpoint and returns its data, throwing on any error. */
export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = await readOperationResult<T>(response);

  if (response.status === 401) {
    throw new UnauthorizedError(payload?.errors?.join(" ") || undefined);
  }

  if (!response.ok || payload?.isValid === false) {
    throw new Error(payload?.errors?.join(" ") || `Request failed: ${response.statusText}`);
  }

  return payload?.data as T;
}
