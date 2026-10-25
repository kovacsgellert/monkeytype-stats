using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Profile.Get;

public record GetMonkeyTypeProfileQuery : IRequest<OperationResult<MonkeyTypeProfileDto>>;
