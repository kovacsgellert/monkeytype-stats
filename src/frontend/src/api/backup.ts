export type BackupDownload = {
  blob: Blob;
  fileName: string;
};

import type { OperationResult } from "../types/operationResult";
import { createApiKeyAuthHeaders } from "./apiKeyAuth";

export type RestoreBackupResult = {
  resultsAdded: number;
  resultsSkipped: number;
  resultDetailsAdded: number;
  resultDetailsSkipped: number;
  monkeyTypeApiResponseLogAdded: number;
  monkeyTypeApiResponseLogSkipped: number;
};

const API_BASE = "/api";

export async function createBackup(apiKey: string): Promise<BackupDownload> {
  const response = await fetch(`${API_BASE}/backup`, {
    method: "POST",
    headers: createApiKeyAuthHeaders(apiKey),
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error("Failed to create backup.");
  }

  const blob = await response.blob();
  const header = response.headers.get("content-disposition");
  const match = header?.match(/filename="?([^";]+)"?/i);
  const fileName = match?.[1] ?? "monkeytype-stats-backup.json";

  return { blob, fileName };
}

export async function restoreBackup(
  backupFile: File,
  apiKey: string,
): Promise<RestoreBackupResult> {
  const formData = new FormData();
  formData.append("backupFile", backupFile);

  const response = await fetch(`${API_BASE}/backup/restore`, {
    method: "POST",
    headers: createApiKeyAuthHeaders(apiKey),
    body: formData,
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  let payload: OperationResult<RestoreBackupResult> | null = null;

  try {
    payload = (await response.json()) as OperationResult<RestoreBackupResult>;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.isValid === false) {
    const errorMessage = payload?.errors?.[0] ?? "Failed to restore backup.";
    throw new Error(errorMessage);
  }

  if (!payload?.data) {
    throw new Error("Restore response missing data.");
  }

  return payload.data;
}
