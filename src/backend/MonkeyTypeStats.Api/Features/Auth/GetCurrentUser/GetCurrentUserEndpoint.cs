using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Auth.GetCurrentUser;

public static class GetCurrentUserEndpoint
{
    public static WebApplication MapGetCurrentUserEndpoint(this WebApplication app)
    {
        app.MapGet(
                "/api/auth/me",
                async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new GetCurrentUserQuery());
                    return result.ToResult();
                }
            )
            .WithName("GetCurrentUser");

        return app;
    }
}
