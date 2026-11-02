using Microsoft.Extensions.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

builder.AddDockerComposeEnvironment("monkeytype-stats-env");

if (builder.Environment.IsProduction())
    builder.AddContainerRegistry("ghcr", "ghcr.io", "kovacsgellert/monkeytype-stats");

var postgres = builder
    .AddPostgres("postgres")
    .WithPgAdmin((container) => container.WithHostPort(4002))
    .WithDataVolume("monkeytype-stats-data")
    .WithLifetime(ContainerLifetime.Persistent);

var db = postgres.AddDatabase("monkeytype-stats-db");

var apeKey = builder.AddParameter("monkeytype-ape-key", secret: true);
var apiKey = builder.AddParameter("monkeytype-stats-api-key", secret: true);
var adminEmail = builder.AddParameter("monkeytype-stats-admin-email");
var adminPassword = builder.AddParameter("monkeytype-stats-admin-password", secret: true);
var authEnabled = builder.AddParameter(
    "monkeytype-stats-auth-enabled",
    "true",
    publishValueAsDefault: true
);

var api = builder
    .AddProject<Projects.MonkeyTypeStats_Api>("monkeytype-stats-api")
    .WithReference(db)
    .WaitFor(db)
    .WithEnvironment("MonkeyTypeApi__BaseUrl", "https://api.monkeytype.com")
    .WithEnvironment("MonkeyTypeApi__ApeKey", apeKey)
    .WithEnvironment("MonkeyTypeStatsApiKey", apiKey)
    .WithEnvironment("Admin__Email", adminEmail)
    .WithEnvironment("Admin__Password", adminPassword)
    .WithEnvironment("Auth__Enabled", authEnabled)
    .WithRemoteImageTag("1.1.0");

var frontend = builder
    .AddViteApp("monkeytype-stats-frontend", "../../frontend")
    .WithEndpoint("http", endpoint => endpoint.Port = 3000)
    .WithEnvironment("MONKEYTYPE_STATS_FRONTEND_PORT", "3000")
    .WithExternalHttpEndpoints()
    .WithReference(api)
    .WithRemoteImageTag("1.1.0");

builder.Build().Run();
