namespace MonkeyTypeStats.Api.Authentication;

public class AuthSettings
{
    public const string SectionName = "Auth";

    /// <summary>
    /// When true, every endpoint is accessible without logging in or providing the API key.
    /// Only meant for stacks that are not reachable from the public internet.
    /// </summary>
    public bool Disabled { get; set; }
}
