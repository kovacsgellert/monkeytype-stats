using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Settings.CreateBackup;

public record CreateBackupCommand : IRequest<OperationResult<BackupFileResult>>;
