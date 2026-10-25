using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.Goals.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Get;

public record GetGoalsQuery : IRequest<OperationResult<List<GoalDto>>>;
