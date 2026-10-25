using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.SavedViews.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Update;

public class UpdateSavedViewCommandHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<UpdateSavedViewCommand, OperationResult<SavedViewDto>>
{
    public async Task<OperationResult<SavedViewDto>> Handle(
        UpdateSavedViewCommand command,
        CancellationToken cancellationToken
    )
    {
        var request = command.Request;
        var errors = request.Validate();
        if (errors.Count > 0)
        {
            return OperationResult<SavedViewDto>.Error(errors);
        }

        var savedView = await dbContext.SavedViews.FindAsync([command.Id], cancellationToken);
        if (savedView is null)
        {
            return OperationResult<SavedViewDto>.Error(
                $"Saved view with id '{command.Id}' not found."
            );
        }

        savedView.Name = request.Name.Trim();
        savedView.Filter = JsonColumn.Serialize(request.Filter);
        savedView.SortOrder = request.SortOrder ?? savedView.SortOrder;
        savedView.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<SavedViewDto>.Ok(savedView.ToDto());
    }
}
