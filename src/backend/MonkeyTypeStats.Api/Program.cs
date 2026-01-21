using Hangfire;
using MediatR;
using MonkeyTypeStats.Api.Features.Results.Get;
using MonkeyTypeStats.Api.Jobs;
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

// Register services
builder.Services.AddSingleton<ResultsFileService>();

// Add Hangfire with in-memory storage
builder.Services.AddHangfire(config =>
    config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseInMemoryStorage()
);

builder.Services.AddHangfireServer();

// Register the job
builder.Services.AddScoped<FetchResultsJob>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

// Map Hangfire dashboard (available at /hangfire)
app.MapHangfireDashboard();

// Register the recurring job to run daily at midnight UTC
RecurringJob.AddOrUpdate<FetchResultsJob>(
    "fetch-monkeytype-results",
    job => job.ExecuteAsync(),
    Cron.Daily
);

app.MapGet(
        "/api/results",
        async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetResultsQuery());
            return result is null
                ? Results.NotFound("No results file found. Wait for the daily fetch job to run.")
                : Results.Ok(result);
        }
    )
    .WithName("GetResults");

app.Run();
