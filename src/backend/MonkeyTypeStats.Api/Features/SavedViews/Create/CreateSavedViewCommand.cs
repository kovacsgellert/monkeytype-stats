using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.SavedViews.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Create;

public record CreateSavedViewCommand(SaveSavedViewRequest Request)
    : IRequest<OperationResult<SavedViewDto>>;
