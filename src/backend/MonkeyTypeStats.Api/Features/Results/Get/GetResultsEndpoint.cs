using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Results.Get;

public static class GetResultsEndpoint
{
    public static WebApplication MapGetResultsEndpoint(this WebApplication app)
    {
        app.MapGet(
                "/api/results",
                async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new GetResultsQuery());
                    return result.ToResult();
                }
            )
            .WithName("GetResults");

        return app;
    }
}
