using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.SavedViews.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Update;

public record UpdateSavedViewCommand(Guid Id, SaveSavedViewRequest Request)
    : IRequest<OperationResult<SavedViewDto>>;
