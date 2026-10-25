using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Get;

public static class GetSavedViewsEndpoint
{
    public static WebApplication MapGetSavedViewsEndpoint(this WebApplication app)
    {
        app.MapGet(
                "/api/saved-views",
                async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new GetSavedViewsQuery());
                    return result.ToResult();
                }
            )
            .WithName("GetSavedViews");

        return app;
    }
}
