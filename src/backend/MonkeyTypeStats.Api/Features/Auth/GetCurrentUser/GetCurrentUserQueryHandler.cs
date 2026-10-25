using System.Security.Claims;
using MediatR;
using Microsoft.Extensions.Options;
using MonkeyTypeStats.Api.Authentication;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Auth.GetCurrentUser;

public class GetCurrentUserQueryHandler(
    IHttpContextAccessor httpContextAccessor,
    IOptions<AuthSettings> authSettings
) : IRequestHandler<GetCurrentUserQuery, OperationResult<CurrentUserDto>>
{
    public Task<OperationResult<CurrentUserDto>> Handle(
        GetCurrentUserQuery request,
        CancellationToken cancellationToken
    )
    {
        if (authSettings.Value.Disabled)
        {
            return Task.FromResult(
                OperationResult<CurrentUserDto>.Ok(new CurrentUserDto(false, null, true, true))
            );
        }

        var user = httpContextAccessor.HttpContext?.User;
        var dto =
            user?.Identity?.IsAuthenticated == true
                ? new CurrentUserDto(
                    true,
                    user.FindFirstValue(ClaimTypes.Email) ?? user.Identity.Name,
                    user.IsInRole(AuthRoles.Admin),
                    false
                )
                : new CurrentUserDto(false, null, false, false);

        return Task.FromResult(OperationResult<CurrentUserDto>.Ok(dto));
    }
}
