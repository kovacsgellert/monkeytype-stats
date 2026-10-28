using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Authentication;

public static class AuthenticationSetup
{
    public const string CookieName = "monkeytype-stats.auth";

    public static WebApplicationBuilder AddAppAuthentication(this WebApplicationBuilder builder)
    {
        var authSettingsSection = builder.Configuration.GetSection(AuthSettings.SectionName);
        builder.Services.Configure<AuthSettings>(authSettingsSection);
        var authDisabled = authSettingsSection.Get<AuthSettings>()?.Disabled == true;

        builder.Services.Configure<AdminOptions>(
            builder.Configuration.GetSection(AdminOptions.SectionName)
        );

        builder
            .Services.AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddScheme<AuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(
                ApiKeyAuthenticationHandler.SchemeName,
                _ => { }
            )
            .AddIdentityCookies();

        builder
            .Services.AddIdentityCore<AppUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 12;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<MonkeyTypeStatsDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        builder.Services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.Name = CookieName;
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Strict;
            // In production the API sits behind proxies that may forward plain http,
            // so always mark the cookie as Secure there; the browser only sees https.
            options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
                ? CookieSecurePolicy.SameAsRequest
                : CookieSecurePolicy.Always;
            options.ExpireTimeSpan = TimeSpan.FromDays(14);
            options.SlidingExpiration = true;
            options.Events.OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
            options.Events.OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });

        builder
            .Services.AddDataProtection()
            .SetApplicationName("monkeytype-stats")
            .PersistKeysToDbContext<MonkeyTypeStatsDbContext>();

        builder.Services.AddAuthorization(options =>
            options.AddPolicy(
                AuthPolicies.Admin,
                policy =>
                {
                    if (authDisabled)
                    {
                        policy.RequireAssertion(_ => true);
                        return;
                    }

                    policy
                        .AddAuthenticationSchemes(
                            IdentityConstants.ApplicationScheme,
                            ApiKeyAuthenticationHandler.SchemeName
                        )
                        .RequireAuthenticatedUser()
                        .RequireRole(AuthRoles.Admin);
                }
            )
        );

        builder.Services.AddRateLimiter(options =>
            options.AddPolicy<string, LoginRateLimiterPolicy>(LoginRateLimiterPolicy.PolicyName)
        );

        builder.Services.AddScoped<AdminSeeder>();

        return builder;
    }
}
