using MediatR;
using MonkeyTypeStats.Api.Common;
using HttpResults = Microsoft.AspNetCore.Http.Results;

namespace MonkeyTypeStats.Api.Features.Backup.Create;

public static class CreateBackupEndpoint
{
    public static WebApplication MapCreateBackupEndpoint(this WebApplication app)
    {
        app.MapPost(
                "/api/backup",
                async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new CreateBackupCommand());
                    if (!result.IsValid || result.Data is null)
                    {
                        return result.ToResult();
                    }

                    return HttpResults.File(
                        result.Data.Content,
                        "application/json",
                        result.Data.FileName
                    );
                }
            )
            .WithName("CreateBackup")
            .RequireAuthorization("ApiKey");

        return app;
    }
}
