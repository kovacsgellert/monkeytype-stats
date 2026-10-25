using MediatR;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.Goals.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Get;

public class GetGoalsQueryHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<GetGoalsQuery, OperationResult<List<GoalDto>>>
{
    public async Task<OperationResult<List<GoalDto>>> Handle(
        GetGoalsQuery request,
        CancellationToken cancellationToken
    )
    {
        var goals = await dbContext
            .Goals.AsNoTracking()
            .OrderBy(goal => goal.CreatedAt)
            .ToListAsync(cancellationToken);

        return OperationResult<List<GoalDto>>.Ok(goals.Select(goal => goal.ToDto()).ToList());
    }
}
