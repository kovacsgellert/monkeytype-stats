using MediatR;
using MonkeyTypeStats.Api.Common;
using HttpResults = Microsoft.AspNetCore.Http.Results;

namespace MonkeyTypeStats.Api.Features.Backup.Restore;

public static class RestoreBackupEndpoint
{
    public static WebApplication MapRestoreBackupEndpoint(this WebApplication app)
    {
        app.MapPost(
                "/api/backup/restore",
                async (IFormFile backupFile, IMediator mediator) =>
                {
                    if (backupFile.Length == 0)
                    {
                        return HttpResults.BadRequest(
                            OperationResult.Error("Backup file is required.")
                        );
                    }

                    using var stream = backupFile.OpenReadStream();
                    using var reader = new StreamReader(stream);
                    var backupJson = await reader.ReadToEndAsync();

                    var result = await mediator.Send(new RestoreBackupCommand(backupJson));
                    return result.ToResult();
                }
            )
            .DisableAntiforgery()
            .Accepts<IFormFile>("multipart/form-data")
            .WithName("RestoreBackup");

        return app;
    }
}
