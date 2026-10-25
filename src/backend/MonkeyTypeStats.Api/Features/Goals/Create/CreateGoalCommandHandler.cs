using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.Goals.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Create;

public class CreateGoalCommandHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<CreateGoalCommand, OperationResult<GoalDto>>
{
    public async Task<OperationResult<GoalDto>> Handle(
        CreateGoalCommand command,
        CancellationToken cancellationToken
    )
    {
        var errors = command.Request.Validate();
        if (errors.Count > 0)
        {
            return OperationResult<GoalDto>.Error(errors);
        }

        var now = DateTime.UtcNow;
        var goal = new Goal
        {
            Id = Guid.NewGuid(),
            StartedAt = now,
            CreatedAt = now,
            UpdatedAt = now,
        };
        goal.Apply(command.Request);

        dbContext.Goals.Add(goal);
        await dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<GoalDto>.Ok(goal.ToDto());
    }
}
