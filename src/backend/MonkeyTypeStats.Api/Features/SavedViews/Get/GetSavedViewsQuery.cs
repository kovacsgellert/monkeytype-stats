using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.SavedViews.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Get;

public record GetSavedViewsQuery : IRequest<OperationResult<List<SavedViewDto>>>;
