using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.SavedViews.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Update;

public static class UpdateSavedViewEndpoint
{
    public static WebApplication MapUpdateSavedViewEndpoint(this WebApplication app)
    {
        app.MapPut(
                "/api/saved-views/{id:guid}",
                async (Guid id, SaveSavedViewRequest request, IMediator mediator) =>
                {
                    var result = await mediator.Send(new UpdateSavedViewCommand(id, request));
                    return result.ToResult();
                }
            )
            .WithName("UpdateSavedView")
            .RequireAuthorization("ApiKey");

        return app;
    }
}
