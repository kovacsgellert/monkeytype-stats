using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Auth.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<OperationResult<CurrentUserDto>>;
