using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Profile.Get;

public static class GetMonkeyTypeProfileEndpoint
{
    public static WebApplication MapGetMonkeyTypeProfileEndpoint(this WebApplication app)
    {
        app.MapGet(
                "/api/monkeytype/profile",
                async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new GetMonkeyTypeProfileQuery());
                    return result.ToResult();
                }
            )
            .WithName("GetMonkeyTypeProfile");

        return app;
    }
}
