using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Get;

public static class GetGoalsEndpoint
{
    public static WebApplication MapGetGoalsEndpoint(this WebApplication app)
    {
        app.MapGet(
                "/api/goals",
                async (IMediator mediator) =>
                {
                    var result = await mediator.Send(new GetGoalsQuery());
                    return result.ToResult();
                }
            )
            .WithName("GetGoals");

        return app;
    }
}
