import type { OperationResult } from "../types/operationResult";
import type { Result, ResultDetails } from "../types/result";

export async function fetchResults(): Promise<OperationResult<Result[]>> {
  const response = await fetch(`api/results`);

  if (!response.ok) {
    throw new Error(`Failed to fetch results: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchResultDetails(
  resultId: string,
): Promise<OperationResult<ResultDetails>> {
  const response = await fetch(`api/results/${resultId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch result details: ${response.statusText}`);
  }

  return response.json();
}
