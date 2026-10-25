using MediatR;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.Profile.GetLeaderboardHistory;

public class GetLeaderboardHistoryQueryHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<GetLeaderboardHistoryQuery, OperationResult<List<LeaderboardHistoryPointDto>>>
{
    public async Task<OperationResult<List<LeaderboardHistoryPointDto>>> Handle(
        GetLeaderboardHistoryQuery request,
        CancellationToken cancellationToken
    )
    {
        var snapshots = await dbContext
            .LeaderboardSnapshots.AsNoTracking()
            .Where(snapshot =>
                snapshot.Language == request.Language
                && snapshot.Mode == request.Mode
                && snapshot.Mode2 == request.Mode2
            )
            .OrderBy(snapshot => snapshot.CapturedAt)
            .ToListAsync(cancellationToken);

        // manual imports can add several snapshots a day, keep the last one of each UTC day
        var history = snapshots
            .GroupBy(snapshot => snapshot.CapturedAt.Date)
            .Select(group => group.Last())
            .Select(snapshot => new LeaderboardHistoryPointDto(
                snapshot.CapturedAt,
                snapshot.Rank,
                snapshot.LeaderboardSize,
                LeaderboardMath.TopPercent(snapshot.Rank, snapshot.LeaderboardSize),
                snapshot.Wpm
            ))
            .ToList();

        return OperationResult<List<LeaderboardHistoryPointDto>>.Ok(history);
    }
}
