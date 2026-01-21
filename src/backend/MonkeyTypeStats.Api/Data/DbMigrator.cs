using Microsoft.EntityFrameworkCore;

namespace MonkeyTypeStats.Api.Data;

public class DbMigrator
{
    private readonly MonkeyTypeStatsDbContext _dbContext;
    private readonly ILogger<DbMigrator> _logger;

    public DbMigrator(MonkeyTypeStatsDbContext dbContext, ILogger<DbMigrator> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task MigrateAsync()
    {
        var maxRetries = 3;
        var delay = TimeSpan.FromSeconds(10);

        for (var i = 0; i < maxRetries; i++)
        {
            try
            {
                _logger.LogInformation(
                    "Attempting to apply database migrations (attempt {Attempt}/{MaxRetries})",
                    i + 1,
                    maxRetries
                );
                await _dbContext.Database.MigrateAsync();
                _logger.LogInformation("Database migrations applied successfully");
                break;
            }
            catch (Exception ex) when (i < maxRetries - 1)
            {
                _logger.LogWarning(
                    ex,
                    "Database not ready, retrying in {Delay} seconds...",
                    delay.TotalSeconds
                );
                await Task.Delay(delay);
            }
        }
    }
}
