using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Delete;

public static class DeleteSavedViewEndpoint
{
    public static WebApplication MapDeleteSavedViewEndpoint(this WebApplication app)
    {
        app.MapDelete(
                "/api/saved-views/{id:guid}",
                async (Guid id, IMediator mediator) =>
                {
                    var result = await mediator.Send(new DeleteSavedViewCommand(id));
                    return result.ToResult();
                }
            )
            .WithName("DeleteSavedView")
            .RequireAuthorization("ApiKey");

        return app;
    }
}
