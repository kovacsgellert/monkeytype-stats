using MediatR;
using MonkeyTypeStats.Api.Authentication;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.Goals.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Update;

public static class UpdateGoalEndpoint
{
    public static WebApplication MapUpdateGoalEndpoint(this WebApplication app)
    {
        app.MapPut(
                "/api/goals/{id:guid}",
                async (Guid id, SaveGoalRequest request, IMediator mediator) =>
                {
                    var result = await mediator.Send(new UpdateGoalCommand(id, request));
                    return result.ToResult();
                }
            )
            .WithName("UpdateGoal")
            .RequireAuthorization(AuthPolicies.Admin);

        return app;
    }
}
