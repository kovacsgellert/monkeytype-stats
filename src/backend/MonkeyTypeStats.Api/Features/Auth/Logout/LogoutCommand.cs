using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Auth.Logout;

public record LogoutCommand : IRequest<OperationResult>;
