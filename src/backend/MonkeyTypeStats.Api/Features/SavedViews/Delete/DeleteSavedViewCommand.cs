using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.SavedViews.Delete;

public record DeleteSavedViewCommand(Guid Id) : IRequest<OperationResult>;
