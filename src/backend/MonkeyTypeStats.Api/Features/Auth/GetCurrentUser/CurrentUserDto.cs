namespace MonkeyTypeStats.Api.Features.Auth.GetCurrentUser;

public record CurrentUserDto(bool IsAuthenticated, string? Email, bool IsAdmin, bool AuthDisabled);
