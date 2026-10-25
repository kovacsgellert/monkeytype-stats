namespace MonkeyTypeStats.Api.Authentication;

public class AdminOptions
{
    public const string SectionName = "Admin";

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// When true, the admin password is reset to <see cref="Password"/> on startup.
    /// Otherwise the password is only used when the admin account is first created.
    /// </summary>
    public bool ResetPassword { get; set; }
}
