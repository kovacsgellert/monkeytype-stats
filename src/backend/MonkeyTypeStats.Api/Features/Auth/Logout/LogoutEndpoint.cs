using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Auth.Logout;

public static class LogoutEndpoint
{
    public static WebApplication MapLogoutEndpoint(this WebApplication app)
    {
        app.MapPost(
                "/api/auth/logout",
                async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new LogoutCommand());
                    return result.ToResult();
                }
            )
            .WithName("Logout");

        return app;
    }
}
