using MediatR;
using MonkeyTypeStats.Api.Authentication;
using HttpResults = Microsoft.AspNetCore.Http.Results;

namespace MonkeyTypeStats.Api.Features.Auth.Login;

public static class LoginEndpoint
{
    public static WebApplication MapLoginEndpoint(this WebApplication app)
    {
        app.MapPost(
                "/api/auth/login",
                async (LoginRequest request, IMediator mediator) =>
                {
                    var result = await mediator.Send(new LoginCommand(request));
                    return result.IsValid
                        ? HttpResults.Ok(result)
                        : HttpResults.Json(result, statusCode: StatusCodes.Status401Unauthorized);
                }
            )
            .WithName("Login")
            .RequireRateLimiting(LoginRateLimiterPolicy.PolicyName);

        return app;
    }
}
