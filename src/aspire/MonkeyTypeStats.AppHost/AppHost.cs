var builder = DistributedApplication.CreateBuilder(args);

builder.AddDockerComposeEnvironment("monkeytype-stats-env");

var postgres = builder
    .AddPostgres("postgres")
    .WithPgAdmin((container) => container.WithHostPort(4002))
    .WithDataVolume("monkeytype-stats-data");

var db = postgres.AddDatabase("monkeytype-stats-db");

var apeKey = builder.AddParameter("monkeytype-ape-key", secret: true);

var api = builder
    .AddProject<Projects.MonkeyTypeStats_Api>("monkeytype-stats-api")
    .WithReference(db)
    .WaitFor(db)
    .WithEnvironment("MonkeyTypeApi__BaseUrl", "https://api.monkeytype.com")
    .WithEnvironment("MonkeyTypeApi__ApeKey", apeKey);

var frontend = builder
    .AddViteApp("monkeytype-stats-frontend", "../../frontend")
    .WithEndpoint("http", endpoint => endpoint.Port = 3000)
    .WithEnvironment("MONKEYTYPE_STATS_FRONTEND_PORT", "3000")
    .WithExternalHttpEndpoints()
    .WithReference(api);

builder.Build().Run();
