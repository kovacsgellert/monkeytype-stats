using MediatR;
using Microsoft.AspNetCore.Mvc;
using MonkeyTypeStats.Api.Authentication;
using MonkeyTypeStats.Api.Common;
using HttpResults = Microsoft.AspNetCore.Http.Results;

namespace MonkeyTypeStats.Api.Features.Backup.Restore;

public static class RestoreBackupEndpoint
{
    // matches client_max_body_size in the frontend nginx config
    private const long MaxBackupSizeBytes = 1024L * 1024 * 1024;

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

                    await using var stream = backupFile.OpenReadStream();
                    var result = await mediator.Send(new RestoreBackupCommand(stream));
                    return result.ToResult();
                }
            )
            // Kestrel allows 30 MB and forms 128 MB by default, backups with result details are larger
            .WithMetadata(new RequestSizeLimitAttribute(MaxBackupSizeBytes))
            .WithFormOptions(multipartBodyLengthLimit: MaxBackupSizeBytes)
            .DisableAntiforgery()
            .Accepts<IFormFile>("multipart/form-data")
            .WithName("RestoreBackup")
            .RequireAuthorization(AuthPolicies.Admin);

        return app;
    }
}
