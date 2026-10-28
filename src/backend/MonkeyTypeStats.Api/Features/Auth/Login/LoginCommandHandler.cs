using MediatR;
using Microsoft.AspNetCore.Identity;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.Auth.Login;

public class LoginCommandHandler(
    UserManager<AppUser> userManager,
    SignInManager<AppUser> signInManager
) : IRequestHandler<LoginCommand, OperationResult>
{
    private const string InvalidCredentialsMessage = "Invalid email or password.";

    public async Task<OperationResult> Handle(
        LoginCommand command,
        CancellationToken cancellationToken
    )
    {
        var (email, password) = command.Request;
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrEmpty(password))
        {
            return OperationResult.Error(InvalidCredentialsMessage);
        }

        var user = await userManager.FindByEmailAsync(email.Trim());
        if (user is null)
        {
            return OperationResult.Error(InvalidCredentialsMessage);
        }

        // there is a single admin account, so locking it after failed attempts would let anyone
        // lock the owner out; brute force is limited by the login rate limiter instead
        var result = await signInManager.PasswordSignInAsync(
            user,
            password,
            isPersistent: true,
            lockoutOnFailure: false
        );

        if (result.IsLockedOut)
        {
            return OperationResult.Error(
                "Too many failed login attempts. The account is temporarily locked."
            );
        }

        return result.Succeeded
            ? OperationResult.Ok()
            : OperationResult.Error(InvalidCredentialsMessage);
    }
}
