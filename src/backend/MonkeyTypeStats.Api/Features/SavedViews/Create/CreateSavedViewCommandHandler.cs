using MediatR;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.SavedViews.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Create;

public class CreateSavedViewCommandHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<CreateSavedViewCommand, OperationResult<SavedViewDto>>
{
    public async Task<OperationResult<SavedViewDto>> Handle(
        CreateSavedViewCommand command,
        CancellationToken cancellationToken
    )
    {
        var request = command.Request;
        var errors = request.Validate();
        if (errors.Count > 0)
        {
            return OperationResult<SavedViewDto>.Error(errors);
        }

        // new views go to the end unless the caller picks a position
        var sortOrder =
            request.SortOrder
            ?? (
                await dbContext.SavedViews.MaxAsync(view => (int?)view.SortOrder, cancellationToken)
                ?? -1
            ) + 1;

        var now = DateTime.UtcNow;
        var savedView = new SavedView
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Filter = JsonColumn.Serialize(request.Filter),
            SortOrder = sortOrder,
            CreatedAt = now,
            UpdatedAt = now,
        };

        dbContext.SavedViews.Add(savedView);
        await dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<SavedViewDto>.Ok(savedView.ToDto());
    }
}
