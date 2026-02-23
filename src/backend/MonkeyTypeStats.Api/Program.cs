using Hangfire;
using MediatR;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.Backup.Create;
using MonkeyTypeStats.Api.Features.Backup.Restore;
using MonkeyTypeStats.Api.Features.Results.Get;
using MonkeyTypeStats.Api.Features.Results.GetById;
using MonkeyTypeStats.Api.Features.Results.Import;
using MonkeyTypeStats.Api.Features.Version.Get;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;
using MonkeyTypeStats.Api.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var monkeyTypeApiConfig = builder.Configuration.GetSection("MonkeyTypeApi");

if (
    monkeyTypeApiConfig is null
    || string.IsNullOrEmpty(monkeyTypeApiConfig["BaseUrl"])
    || string.IsNullOrEmpty(monkeyTypeApiConfig["ApeKey"])
)
{
    throw new InvalidOperationException(
        "MonkeyTypeApi configuration section is missing or incomplete."
    );
}

builder.Services.AddHttpClient<MonkeyTypeApiClient>(client =>
{
    client.BaseAddress = new Uri(monkeyTypeApiConfig["BaseUrl"]!);
    client.DefaultRequestHeaders.Add("Authorization", $"ApeKey {monkeyTypeApiConfig["ApeKey"]}");
});

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<Program>());

builder.AddNpgsqlDbContext<MonkeyTypeStatsDbContext>("monkeytype-stats-db");

// Register services
builder.Services.AddScoped<DbMigrator>();

builder.Services.AddHangfire(config =>
    config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseInMemoryStorage()
);

builder.Services.AddHangfireServer();

builder.Services.AddScoped<ImportResultsJob>();
builder.Services.AddScoped<ImportResultDetailsJob>();
builder.Services.AddSingleton<AppVersionProvider>();

var app = builder.Build();

// Apply database migrations on startup
using (var scope = app.Services.CreateScope())
{
    var dbMigrator = scope.ServiceProvider.GetRequiredService<DbMigrator>();
    await dbMigrator.MigrateAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    app.MapHangfireDashboard();
}

app.UseHttpsRedirection();

var recurringJobManager = app.Services.GetRequiredService<IRecurringJobManager>();
recurringJobManager.AddOrUpdate<ImportResultsJob>(
    "import-monkeytype-results",
    job => job.ExecuteAsync(),
    Cron.Daily
);

recurringJobManager.AddOrUpdate<ImportResultDetailsJob>(
    "import-monkeytype-result-details",
    job => job.ExecuteAsync(),
    Cron.Hourly
);

app.MapGetResultsEndpoint();
app.MapGetResultByIdEndpoint();
app.MapCreateBackupEndpoint();
app.MapRestoreBackupEndpoint();
app.MapGetAppVersionEndpoint();

app.Run();
