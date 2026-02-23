using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Settings.AppVersion;

public static class GetAppVersionEndpoint
{
    public static WebApplication MapGetAppVersionEndpoint(this WebApplication app)
    {
        app.MapGet(
                "/api/version",
                async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new GetAppVersionQuery());
                    return result.ToResult();
                }
            )
            .WithName("GetAppVersion");

        return app;
    }
}
