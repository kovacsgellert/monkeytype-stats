namespace MonkeyTypeStats.Api.Features.Backup.Restore;

public record RestoreBackupResult(
    int ResultsAdded,
    int ResultsSkipped,
    int ResultDetailsAdded,
    int ResultDetailsSkipped,
    int MonkeyTypeApiResponseLogAdded,
    int MonkeyTypeApiResponseLogSkipped
);
