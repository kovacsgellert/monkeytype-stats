using MediatR;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.Results.Get;

public class GetResultsQueryHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<GetResultsQuery, OperationResult<List<ResultDto>>>
{
    public async Task<OperationResult<List<ResultDto>>> Handle(
        GetResultsQuery request,
        CancellationToken cancellationToken
    )
    {
        var results = await dbContext
            .Results.OrderByDescending(r => r.Timestamp)
            .Select(r => new ResultDto(
                r.Id,
                r.Wpm,
                r.RawWpm,
                r.CharStats,
                r.Acc,
                r.Mode,
                r.Mode2,
                r.QuoteLength,
                r.Timestamp,
                r.TestDuration,
                r.Consistency,
                r.KeyConsistency,
                r.Uid,
                r.RestartCount,
                r.IncompleteTestSeconds,
                r.AfkDuration,
                r.Tags,
                r.BailedOut,
                r.BlindMode,
                r.LazyMode,
                r.Funbox,
                r.Language,
                r.Difficulty,
                r.Numbers,
                r.Punctuation,
                r.IsPb
            ))
            .ToListAsync(cancellationToken);

        return OperationResult<List<ResultDto>>.Ok(results);
    }
}
