import type { OperationResult } from "../types/operationResult";

export type AppVersionResponse = {
  version: string;
};

const API_BASE = "/api";

export async function fetchAppVersion(): Promise<AppVersionResponse> {
  const response = await fetch(`${API_BASE}/version`);
  let payload: OperationResult<AppVersionResponse> | null = null;

  try {
    payload = (await response.json()) as OperationResult<AppVersionResponse>;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.isValid === false) {
    const errorMessage = payload?.errors?.[0] ?? "Failed to fetch app version.";
    throw new Error(errorMessage);
  }

  if (!payload?.data) {
    throw new Error("App version response missing data.");
  }

  return payload.data;
}
