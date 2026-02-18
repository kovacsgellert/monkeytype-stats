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
            .SelectResultDtos()
            .ToListAsync(cancellationToken);

        return OperationResult<List<ResultDto>>.Ok(results);
    }
}
