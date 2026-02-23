using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Backup.Restore;

public record RestoreBackupCommand(string BackupJson)
    : IRequest<OperationResult<RestoreBackupResult>>;
