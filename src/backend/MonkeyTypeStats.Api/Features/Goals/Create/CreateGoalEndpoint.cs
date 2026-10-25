using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.Goals.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Create;

public static class CreateGoalEndpoint
{
    public static WebApplication MapCreateGoalEndpoint(this WebApplication app)
    {
        app.MapPost(
                "/api/goals",
                async (SaveGoalRequest request, IMediator mediator) =>
                {
                    var result = await mediator.Send(new CreateGoalCommand(request));
                    return result.ToResult();
                }
            )
            .WithName("CreateGoal")
            .RequireAuthorization("ApiKey");

        return app;
    }
}
