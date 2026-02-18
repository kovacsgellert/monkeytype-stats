import type { ResultDetailsResponse, ResultsResponse } from "../types/result";

const API_BASE = "/api";

export async function fetchResults(): Promise<ResultsResponse> {
  const response = await fetch(`${API_BASE}/results`);

  if (!response.ok) {
    throw new Error(`Failed to fetch results: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchResultDetails(
  resultId: string,
): Promise<ResultDetailsResponse> {
  const response = await fetch(`${API_BASE}/results/${resultId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch result details: ${response.statusText}`);
  }

  return response.json();
}
