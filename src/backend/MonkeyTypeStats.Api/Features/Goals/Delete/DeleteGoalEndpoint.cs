using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Delete;

public static class DeleteGoalEndpoint
{
    public static WebApplication MapDeleteGoalEndpoint(this WebApplication app)
    {
        app.MapDelete(
                "/api/goals/{id:guid}",
                async (Guid id, IMediator mediator) =>
                {
                    var result = await mediator.Send(new DeleteGoalCommand(id));
                    return result.ToResult();
                }
            )
            .WithName("DeleteGoal")
            .RequireAuthorization("ApiKey");

        return app;
    }
}
