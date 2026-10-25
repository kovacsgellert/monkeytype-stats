using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.Profile.Get;

public class GetMonkeyTypeProfileQueryHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<GetMonkeyTypeProfileQuery, OperationResult<MonkeyTypeProfileDto>>
{
    public async Task<OperationResult<MonkeyTypeProfileDto>> Handle(
        GetMonkeyTypeProfileQuery request,
        CancellationToken cancellationToken
    )
    {
        var profile = await dbContext
            .ProfileSnapshots.AsNoTracking()
            .OrderByDescending(snapshot => snapshot.CapturedAt)
            .Select(snapshot => new ProfileSnapshotDto(
                snapshot.CapturedAt,
                snapshot.CompletedTests,
                snapshot.StartedTests,
                snapshot.TimeTypingSeconds,
                snapshot.StreakLength,
                snapshot.MaxStreakLength,
                snapshot.LastResultTimestamp,
                snapshot.StreakHourOffset
            ))
            .FirstOrDefaultAsync(cancellationToken);

        var boards = await dbContext
            .LeaderboardSnapshots.AsNoTracking()
            .Select(snapshot => new
            {
                snapshot.Language,
                snapshot.Mode,
                snapshot.Mode2,
            })
            .Distinct()
            .ToListAsync(cancellationToken);

        var leaderboards = new List<LeaderboardStandingDto>();
        foreach (var board in boards.OrderBy(b => b.Language).ThenBy(b => b.Mode))
        {
            var latest = await dbContext
                .LeaderboardSnapshots.AsNoTracking()
                .Where(snapshot =>
                    snapshot.Language == board.Language
                    && snapshot.Mode == board.Mode
                    && snapshot.Mode2 == board.Mode2
                )
                .OrderByDescending(snapshot => snapshot.CapturedAt)
                .FirstAsync(cancellationToken);

            var histogram = await dbContext
                .SpeedHistogramSnapshots.AsNoTracking()
                .Where(snapshot =>
                    snapshot.Language == board.Language
                    && snapshot.Mode == board.Mode
                    && snapshot.Mode2 == board.Mode2
                )
                .OrderByDescending(snapshot => snapshot.CapturedAt)
                .FirstOrDefaultAsync(cancellationToken);

            leaderboards.Add(
                new LeaderboardStandingDto(
                    latest.Language,
                    latest.Mode,
                    latest.Mode2,
                    latest.CapturedAt,
                    latest.Rank,
                    latest.FriendsRank,
                    latest.LeaderboardSize,
                    LeaderboardMath.TopPercent(latest.Rank, latest.LeaderboardSize),
                    latest.Wpm,
                    latest.Raw,
                    latest.Acc,
                    latest.Consistency,
                    latest.EntryTimestamp,
                    histogram is null
                        ? null
                        : JsonSerializer.Deserialize<Dictionary<string, int>>(histogram.Buckets),
                    histogram?.CapturedAt
                )
            );
        }

        var personalBests = await dbContext
            .PersonalBests.AsNoTracking()
            .OrderBy(pb => pb.Mode)
            .ThenBy(pb => pb.Mode2)
            .ThenByDescending(pb => pb.Wpm)
            .Select(pb => new PersonalBestDto(
                pb.Mode,
                pb.Mode2,
                pb.Language,
                pb.Difficulty,
                pb.Punctuation,
                pb.Numbers,
                pb.LazyMode,
                pb.Wpm,
                pb.Raw,
                pb.Acc,
                pb.Consistency,
                pb.Timestamp
            ))
            .ToListAsync(cancellationToken);

        var tags = await dbContext
            .Tags.AsNoTracking()
            .OrderBy(tag => tag.Name)
            .Select(tag => new TagDto(tag.Id, tag.Name))
            .ToListAsync(cancellationToken);

        return OperationResult<MonkeyTypeProfileDto>.Ok(
            new MonkeyTypeProfileDto(profile, leaderboards, personalBests, tags)
        );
    }
}
