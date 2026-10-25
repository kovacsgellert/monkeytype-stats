using MediatR;
using MonkeyTypeStats.Api.Authentication;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.SavedViews.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Create;

public static class CreateSavedViewEndpoint
{
    public static WebApplication MapCreateSavedViewEndpoint(this WebApplication app)
    {
        app.MapPost(
                "/api/saved-views",
                async (SaveSavedViewRequest request, IMediator mediator) =>
                {
                    var result = await mediator.Send(new CreateSavedViewCommand(request));
                    return result.ToResult();
                }
            )
            .WithName("CreateSavedView")
            .RequireAuthorization(AuthPolicies.Admin);

        return app;
    }
}
