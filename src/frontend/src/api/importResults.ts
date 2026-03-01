import type { OperationResult } from "../types/operationResult";
import { createApiKeyAuthHeaders } from "./apiKeyAuth";

export type ImportResultsResponse = {
  resultsAdded: number;
};

export async function importResults(apiKey: string): Promise<ImportResultsResponse> {
  const response = await fetch(`api/results/import`, {
    method: "POST",
    headers: createApiKeyAuthHeaders(apiKey),
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }
  let payload: OperationResult<ImportResultsResponse> | null = null;

  try {
    payload = (await response.json()) as OperationResult<ImportResultsResponse>;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.isValid === false) {
    const errorMessage = payload?.errors?.[0] ?? "Failed to import results.";
    throw new Error(errorMessage);
  }

  if (!payload?.data) {
    throw new Error("Import response missing data.");
  }

  return payload.data;
}
