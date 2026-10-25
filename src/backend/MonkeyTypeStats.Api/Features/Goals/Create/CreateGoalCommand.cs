using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.Goals.Common;

namespace MonkeyTypeStats.Api.Features.Goals.Create;

public record CreateGoalCommand(SaveGoalRequest Request) : IRequest<OperationResult<GoalDto>>;
