using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.Goals.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Update;

public record UpdateGoalCommand(Guid Id, SaveGoalRequest Request)
    : IRequest<OperationResult<GoalDto>>;
