using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace MonkeyTypeStats.Api.Authentication;

public sealed class ApiKeyAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IConfiguration configuration
) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "ApiKey";
    public const string AuthorizationHeaderName = "Authorization";
    public const string SchemePrefix = "ApiKey ";
    public const string ConfigKey = "MonkeyTypeStatsApiKey";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var configuredApiKey = configuration[ConfigKey];
        if (string.IsNullOrWhiteSpace(configuredApiKey))
        {
            return Task.FromResult(
                AuthenticateResult.Fail("API key is not configured.")
            );
        }

        if (!Request.Headers.TryGetValue(AuthorizationHeaderName, out var providedApiKey))
        {
            return Task.FromResult(
                AuthenticateResult.Fail("Authorization header is missing.")
            );
        }

        var headerValue = providedApiKey.ToString();
        if (string.IsNullOrWhiteSpace(headerValue))
        {
            return Task.FromResult(AuthenticateResult.Fail("Authorization header is empty."));
        }

        if (!headerValue.StartsWith(SchemePrefix, StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(AuthenticateResult.Fail("Authorization scheme is invalid."));
        }

        var providedValue = headerValue[SchemePrefix.Length..].Trim();
        if (string.IsNullOrWhiteSpace(providedValue))
        {
            return Task.FromResult(AuthenticateResult.Fail("API key is empty."));
        }

        if (!IsApiKeyValid(configuredApiKey, providedValue))
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid API key."));
        }

        var claims = new[] { new Claim(ClaimTypes.Name, "Admin") };
        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    private static bool IsApiKeyValid(string expected, string provided)
    {
        var expectedBytes = Encoding.UTF8.GetBytes(expected);
        var providedBytes = Encoding.UTF8.GetBytes(provided);

        if (expectedBytes.Length != providedBytes.Length)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes);
    }
}
