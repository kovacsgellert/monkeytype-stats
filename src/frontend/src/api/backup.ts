export type BackupDownload = {
  blob: Blob;
  fileName: string;
};

export type RestoreBackupResult = {
  resultsAdded: number;
  resultsSkipped: number;
  resultDetailsAdded: number;
  resultDetailsSkipped: number;
  monkeyTypeApiResponseLogAdded: number;
  monkeyTypeApiResponseLogSkipped: number;
};

type OperationResult<T> = {
  data: T | null;
  errors: string[];
  isValid: boolean;
};

const API_BASE = "/api";

export async function createBackup(): Promise<BackupDownload> {
  const response = await fetch(`${API_BASE}/backup`, { method: "POST" });

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
): Promise<RestoreBackupResult> {
  const formData = new FormData();
  formData.append("backupFile", backupFile);

  const response = await fetch(`${API_BASE}/backup/restore`, {
    method: "POST",
    body: formData,
  });

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
