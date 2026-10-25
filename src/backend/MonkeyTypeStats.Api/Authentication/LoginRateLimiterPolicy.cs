using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Authentication;

public sealed class LoginRateLimiterPolicy : IRateLimiterPolicy<string>
{
    public const string PolicyName = "login";

    public Func<OnRejectedContext, CancellationToken, ValueTask>? OnRejected { get; } =
        async (context, token) =>
        {
            var result = OperationResult.Error(
                "Too many login attempts. Please try again in a few minutes."
            );
            context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            await context.HttpContext.Response.WriteAsJsonAsync(result, cancellationToken: token);
        };

    public RateLimitPartition<string> GetPartition(HttpContext httpContext) =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0,
            }
        );
}
