using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.Goals.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Update;

public class UpdateGoalCommandHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<UpdateGoalCommand, OperationResult<GoalDto>>
{
    public async Task<OperationResult<GoalDto>> Handle(
        UpdateGoalCommand command,
        CancellationToken cancellationToken
    )
    {
        var errors = command.Request.Validate();
        if (errors.Count > 0)
        {
            return OperationResult<GoalDto>.Error(errors);
        }

        var goal = await dbContext.Goals.FindAsync([command.Id], cancellationToken);
        if (goal is null)
        {
            return OperationResult<GoalDto>.Error($"Goal with id '{command.Id}' not found.");
        }

        goal.Apply(command.Request);
        goal.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<GoalDto>.Ok(goal.ToDto());
    }
}
