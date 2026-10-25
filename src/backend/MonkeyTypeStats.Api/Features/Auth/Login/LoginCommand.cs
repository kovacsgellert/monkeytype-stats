using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Auth.Login;

public record LoginCommand(LoginRequest Request) : IRequest<OperationResult>;
