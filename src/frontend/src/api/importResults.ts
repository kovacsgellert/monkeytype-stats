import type { OperationResult } from "../types/operationResult";
import { UnauthorizedError } from "./apiClient";

export type ImportResultsResponse = {
  resultsAdded: number;
  profileImported: boolean;
};

export async function importResults(): Promise<ImportResultsResponse> {
  const response = await fetch(`api/results/import`, {
    method: "POST",
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
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
