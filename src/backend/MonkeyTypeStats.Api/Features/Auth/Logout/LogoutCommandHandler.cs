using MediatR;
using Microsoft.AspNetCore.Identity;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.Auth.Logout;

public class LogoutCommandHandler(SignInManager<AppUser> signInManager)
    : IRequestHandler<LogoutCommand, OperationResult>
{
    public async Task<OperationResult> Handle(
        LogoutCommand command,
        CancellationToken cancellationToken
    )
    {
        await signInManager.SignOutAsync();
        return OperationResult.Ok();
    }
}
