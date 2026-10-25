using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Authentication;

public class AdminSeeder(
    UserManager<AppUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IOptions<AdminOptions> adminOptions,
    IOptions<AuthSettings> authSettings,
    ILogger<AdminSeeder> logger
)
{
    public async Task SeedAsync()
    {
        if (authSettings.Value.Disabled)
        {
            logger.LogWarning(
                "Authentication is disabled (Auth:Disabled=true). All endpoints are publicly accessible; do not expose this instance to the internet."
            );
            return;
        }

        await EnsureAdminRoleAsync();

        var options = adminOptions.Value;
        if (string.IsNullOrWhiteSpace(options.Email))
        {
            var existingAdmins = await userManager.GetUsersInRoleAsync(AuthRoles.Admin);
            if (existingAdmins.Count == 0)
            {
                logger.LogWarning(
                    "Admin:Email is not configured and no admin account exists. Login is unavailable until it is set."
                );
            }

            return;
        }

        var email = options.Email.Trim();
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = await RenameExistingAdminAsync(email) ?? await CreateAdminAsync(email, options);
        }
        else if (options.ResetPassword)
        {
            await ResetPasswordAsync(user, options.Password);
        }

        if (!await userManager.IsInRoleAsync(user, AuthRoles.Admin))
        {
            EnsureSucceeded(
                await userManager.AddToRoleAsync(user, AuthRoles.Admin),
                "add the admin account to the Admin role"
            );
        }
    }

    private async Task EnsureAdminRoleAsync()
    {
        if (await roleManager.RoleExistsAsync(AuthRoles.Admin))
        {
            return;
        }

        EnsureSucceeded(
            await roleManager.CreateAsync(new IdentityRole(AuthRoles.Admin)),
            "create the Admin role"
        );
    }

    private async Task<AppUser?> RenameExistingAdminAsync(string email)
    {
        var admins = await userManager.GetUsersInRoleAsync(AuthRoles.Admin);
        if (admins.Count == 0)
        {
            return null;
        }

        if (admins.Count > 1)
        {
            throw new InvalidOperationException(
                $"Admin:Email '{email}' does not match any account and multiple admin accounts exist; cannot decide which one to update."
            );
        }

        var admin = admins[0];
        logger.LogInformation(
            "Changing admin account email from {OldEmail} to {NewEmail}",
            admin.Email,
            email
        );
        admin.Email = email;
        admin.UserName = email;
        admin.EmailConfirmed = true;
        EnsureSucceeded(await userManager.UpdateAsync(admin), "update the admin account email");

        return admin;
    }

    private async Task<AppUser> CreateAdminAsync(string email, AdminOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.Password))
        {
            throw new InvalidOperationException(
                "Admin:Password must be configured to create the admin account."
            );
        }

        var user = new AppUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
        };
        EnsureSucceeded(
            await userManager.CreateAsync(user, options.Password),
            "create the admin account"
        );
        logger.LogInformation("Created admin account {Email}", email);

        return user;
    }

    private async Task ResetPasswordAsync(AppUser user, string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Admin:ResetPassword is enabled but Admin:Password is empty."
            );
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        EnsureSucceeded(
            await userManager.ResetPasswordAsync(user, token, password),
            "reset the admin password"
        );
        await userManager.SetLockoutEndDateAsync(user, null);
        await userManager.ResetAccessFailedCountAsync(user);
        logger.LogWarning(
            "Admin password was reset from configuration. Set Admin:ResetPassword back to false."
        );
    }

    private static void EnsureSucceeded(IdentityResult result, string action)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join(" ", result.Errors.Select(e => e.Description));
        throw new InvalidOperationException($"Failed to {action}: {errors}");
    }
}
