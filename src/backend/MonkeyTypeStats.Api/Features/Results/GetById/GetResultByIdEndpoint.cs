using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Results.GetById;

public static class GetResultByIdEndpoint
{
    public static WebApplication MapGetResultByIdEndpoint(this WebApplication app)
    {
        app.MapGet(
                "/api/results/{id}",
                async (string id, IMediator mediator) =>
                {
                    var result = await mediator.Send(new GetResultByIdQuery(id));
                    return result.ToResult();
                }
            )
            .WithName("GetResultById");

        return app;
    }
}
