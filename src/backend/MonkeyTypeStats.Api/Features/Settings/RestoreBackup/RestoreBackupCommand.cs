using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Settings.RestoreBackup;

public record RestoreBackupCommand(string BackupJson)
    : IRequest<OperationResult<RestoreBackupResult>>;
