using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Backup.Create;

public record CreateBackupCommand : IRequest<OperationResult<BackupFileResult>>;
