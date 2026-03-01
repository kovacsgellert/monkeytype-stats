using System.Threading.RateLimiting;
using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Results.Import;

public static class ImportResultsEndpoint
{
    public static WebApplicationBuilder AddImportResultsRateLimiter(
        this WebApplicationBuilder builder
    )
    {
        builder.Services.AddRateLimiter(options =>
        {
            options.OnRejected = async (context, token) =>
            {
                var result = OperationResult.Error(
                    "Import is limited to once per hour. Please try again later."
                );
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.HttpContext.Response.WriteAsJsonAsync(
                    result,
                    cancellationToken: token
                );
            };

            options.AddPolicy(
                "import-results",
                context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 1,
                            Window = TimeSpan.FromHours(1),
                            QueueLimit = 0,
                        }
                    )
            );
        });

        return builder;
    }

    public static WebApplication MapImportResultsEndpoint(this WebApplication app)
    {
        app.MapPost(
                "/api/results/import",
                async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new ImportResultsCommand());
                    return result.ToResult();
                }
            )
            .WithName("ImportResults")
            .RequireAuthorization("ApiKey")
            .RequireRateLimiting("import-results");

        return app;
    }
}
