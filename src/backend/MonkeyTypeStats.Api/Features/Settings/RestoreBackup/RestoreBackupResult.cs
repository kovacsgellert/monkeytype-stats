namespace MonkeyTypeStats.Api.Features.Settings.RestoreBackup;

public record RestoreBackupResult(
    int ResultsAdded,
    int ResultsSkipped,
    int ResultDetailsAdded,
    int ResultDetailsSkipped,
    int MonkeyTypeApiResponseLogAdded,
    int MonkeyTypeApiResponseLogSkipped
);
