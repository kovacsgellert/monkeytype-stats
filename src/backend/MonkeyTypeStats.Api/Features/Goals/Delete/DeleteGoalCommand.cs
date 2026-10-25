using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Delete;

public record DeleteGoalCommand(Guid Id) : IRequest<OperationResult>;
