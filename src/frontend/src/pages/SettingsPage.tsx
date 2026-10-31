import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { createBackup, restoreBackup } from "../api/backup";
import { importResults } from "../api/importResults";
import { DisplaySettings } from "../components/DisplaySettings";
import { useAppVersion } from "../hooks/useAppVersion";
import { useAuth } from "../hooks/useAuth";

export function SettingsPage() {
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [restoreErrorMessage, setRestoreErrorMessage] = useState<string | null>(
    null,
  );
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [restoreDetails, setRestoreDetails] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const appVersionQuery = useAppVersion();
  const { withLogin } = useAuth();
  const queryClient = useQueryClient();

  const createBackupMutation = useMutation({
    mutationFn: () => withLogin("create a backup", createBackup),
    onSuccess: ({ blob, fileName }) => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: (backupFile: File) => withLogin("restore a backup", () => restoreBackup(backupFile)),
    onSuccess: (data) => {
      // a restore can add results, profile data, saved views and goals, so refetch everything
      void queryClient.invalidateQueries();
      setRestoreSuccess("Backup restored successfully.");
      setRestoreDetails(
        `Results: ${data.resultsAdded} added / ${data.resultsSkipped} skipped. Details: ${data.resultDetailsAdded} added / ${data.resultDetailsSkipped} skipped. Logs: ${data.monkeyTypeApiResponseLogAdded} added / ${data.monkeyTypeApiResponseLogSkipped} skipped. Profile data: ${data.profileRecordsAdded} added. Saved views: ${data.savedViewsAdded} added. Goals: ${data.goalsAdded} added.`,
      );
      setSelectedBackupFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const importResultsMutation = useMutation({
    mutationFn: () => withLogin("import results", importResults),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["results"] });
      void queryClient.invalidateQueries({ queryKey: ["monkeytype-profile"] });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard-history"] });
      setImportMessage(
        `Import complete. Added ${data.resultsAdded} results.${data.profileImported ? " Profile data updated." : " Profile data could not be updated."}`,
      );
    },
  });

  const handleCreateBackup = () => {
    createBackupMutation.reset();
    createBackupMutation.mutate();
  };

  const handleRestoreBackup = () => {
    if (!selectedBackupFile) {
      setRestoreErrorMessage("Please choose a backup file first.");
      return;
    }

    setRestoreErrorMessage(null);
    setRestoreSuccess(null);
    setRestoreDetails(null);
    restoreBackupMutation.mutate(selectedBackupFile);
  };

  const selectBackupFile = (file: File | null) => {
    setSelectedBackupFile(file);
    setRestoreErrorMessage(null);
    setRestoreSuccess(null);
    setRestoreDetails(null);
    restoreBackupMutation.reset();
  };

  const handleImportResults = () => {
    setImportMessage(null);
    importResultsMutation.mutate();
  };

  const restoreError =
    restoreErrorMessage ??
    (restoreBackupMutation.isError
      ? restoreBackupMutation.error instanceof Error
        ? restoreBackupMutation.error.message
        : "Failed to restore backup."
      : null);
  const backupError = createBackupMutation.isError
    ? createBackupMutation.error instanceof Error
      ? createBackupMutation.error.message
      : "Failed to create backup."
    : null;
  const importError = importResultsMutation.isError
    ? importResultsMutation.error instanceof Error
      ? importResultsMutation.error.message
      : "Failed to import results."
    : null;

  const backendVersion = appVersionQuery.data?.version ?? null;
  const backendVersionError = appVersionQuery.isError
    ? appVersionQuery.error instanceof Error
      ? appVersionQuery.error.message
      : "Failed to load backend version."
    : null;
  const frontendVersion = __APP_VERSION__;

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">Settings</h2>
      </div>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 shadow-lg shadow-black/20 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">
              MonkeyType Import
            </p>
            <p className="text-sm text-zinc-500 mt-1 max-w-xl">
              Trigger a manual import from the MonkeyType API. Limited to once per
              hour.
            </p>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              type="button"
              onClick={handleImportResults}
              disabled={importResultsMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800/70 border border-zinc-700/70 text-zinc-100 font-medium hover:bg-zinc-700/70 hover:border-zinc-600 transition-all duration-200 sm:w-auto"
            >
              <svg
                className={`w-4 h-4 ${
                  importResultsMutation.isPending ? "animate-spin" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    importResultsMutation.isPending
                      ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      : "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  }
                />
              </svg>
              {importResultsMutation.isPending ? "Importing..." : "Import results"}
            </button>
          </div>
        </div>
        {importError ? (
          <p className="mt-4 text-sm text-rose-400">{importError}</p>
        ) : null}
        {importMessage ? (
          <p className="mt-4 text-sm text-emerald-400">{importMessage}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 shadow-lg shadow-black/20 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">
              Backup & Restore
            </p>
            <p className="text-sm text-zinc-500 mt-1 max-w-xl">
              Create a portable backup or restore from an existing archive. Use
              this when redeploying the application.
            </p>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              type="button"
              onClick={handleCreateBackup}
              disabled={createBackupMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800/70 border border-zinc-700/70 text-zinc-100 font-medium hover:bg-zinc-700/70 hover:border-zinc-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              <svg
                className={`w-4 h-4 ${
                  createBackupMutation.isPending ? "animate-spin" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    createBackupMutation.isPending
                      ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      : "M12 4v12m0 0l-4-4m4 4l4-4m-9 8h10"
                  }
                />
              </svg>
              {createBackupMutation.isPending ? "Creating..." : "Create backup"}
            </button>
          </div>
        </div>
        {backupError ? (
          <p className="mt-4 text-sm text-rose-400">{backupError}</p>
        ) : null}

        <div className="mt-8">
          <div className="rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-950/40 p-4 sm:p-6">
            <p className="text-sm font-semibold text-zinc-200">
              Restore backup
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Upload the .json file created by the backup tool.
            </p>
            <label
              className={`mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border bg-zinc-900/60 px-4 py-6 text-zinc-300 cursor-pointer hover:border-cyan-500/60 hover:text-zinc-100 transition ${
                isDraggingFile ? "border-cyan-500/80 text-zinc-100" : "border-zinc-700/60"
              }`}
              onDragOver={(event) => {
                // without preventDefault the browser opens the dropped file instead
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                setIsDraggingFile(true);
              }}
              onDragLeave={(event) => {
                // moving over the label's own text also fires dragleave
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setIsDraggingFile(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDraggingFile(false);
                const file = event.dataTransfer.files[0];
                if (!file) return;
                if (!file.name.toLowerCase().endsWith(".json")) {
                  selectBackupFile(null);
                  setRestoreErrorMessage("Backups are .json files.");
                  return;
                }
                if (fileInputRef.current) fileInputRef.current.value = "";
                selectBackupFile(file);
              }}
            >
              <input
                type="file"
                className="sr-only"
                accept=".json"
                ref={fileInputRef}
                onChange={(event) =>
                  selectBackupFile(event.target.files?.[0] ?? null)
                }
              />
              <span className="text-sm font-medium">
                {selectedBackupFile ? selectedBackupFile.name : "Choose file"}
              </span>
              <span className="text-xs text-zinc-500">
                or drag and drop into this panel
              </span>
            </label>
            <button
              type="button"
              onClick={handleRestoreBackup}
              disabled={restoreBackupMutation.isPending || !selectedBackupFile}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700/70 text-sm font-medium text-zinc-200 hover:bg-zinc-700/60 transition disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              <svg
                className={`w-4 h-4 ${
                  restoreBackupMutation.isPending ? "animate-spin" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    restoreBackupMutation.isPending
                      ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      : "M5 12h14M12 5l7 7-7 7"
                  }
                />
              </svg>
              {restoreBackupMutation.isPending
                ? "Restoring..."
                : "Restore backup"}
            </button>
            {restoreError ? (
              <p className="mt-3 text-xs text-rose-400">{restoreError}</p>
            ) : null}
            {restoreSuccess ? (
              <p className="mt-3 text-xs text-emerald-400">
                {restoreSuccess}
                {restoreDetails ? (
                  <span className="block text-[11px] text-emerald-300/80 mt-1">
                    {restoreDetails}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <DisplaySettings />

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 shadow-lg shadow-black/20 p-4 sm:p-6 lg:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400/80">
            Version Info
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            Frontend and backend build versions for this deployment.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              Frontend
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-100">
              {frontendVersion}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              Backend
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-100">
              {appVersionQuery.isLoading ? "Loading..." : backendVersion ?? "-"}
            </p>
            {backendVersionError ? (
              <p className="mt-2 text-xs text-rose-400">
                {backendVersionError}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
