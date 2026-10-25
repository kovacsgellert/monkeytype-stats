using MediatR;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.SavedViews.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Get;

public class GetSavedViewsQueryHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<GetSavedViewsQuery, OperationResult<List<SavedViewDto>>>
{
    public async Task<OperationResult<List<SavedViewDto>>> Handle(
        GetSavedViewsQuery request,
        CancellationToken cancellationToken
    )
    {
        var savedViews = await dbContext
            .SavedViews.AsNoTracking()
            .OrderBy(view => view.SortOrder)
            .ThenBy(view => view.CreatedAt)
            .ToListAsync(cancellationToken);

        return OperationResult<List<SavedViewDto>>.Ok(
            savedViews.Select(view => view.ToDto()).ToList()
        );
    }
}
