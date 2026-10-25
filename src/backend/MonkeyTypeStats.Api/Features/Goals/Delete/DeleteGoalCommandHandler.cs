using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.Goals.Delete;

public class DeleteGoalCommandHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<DeleteGoalCommand, OperationResult>
{
    public async Task<OperationResult> Handle(
        DeleteGoalCommand command,
        CancellationToken cancellationToken
    )
    {
        var goal = await dbContext.Goals.FindAsync([command.Id], cancellationToken);
        if (goal is null)
        {
            return OperationResult.Error($"Goal with id '{command.Id}' not found.");
        }

        dbContext.Goals.Remove(goal);
        await dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult.Ok();
    }
}
