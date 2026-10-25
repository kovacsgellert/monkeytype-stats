using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.SavedViews.Delete;

public class DeleteSavedViewCommandHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<DeleteSavedViewCommand, OperationResult>
{
    public async Task<OperationResult> Handle(
        DeleteSavedViewCommand command,
        CancellationToken cancellationToken
    )
    {
        var savedView = await dbContext.SavedViews.FindAsync([command.Id], cancellationToken);
        if (savedView is null)
        {
            return OperationResult.Error($"Saved view with id '{command.Id}' not found.");
        }

        dbContext.SavedViews.Remove(savedView);
        await dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult.Ok();
    }
}
