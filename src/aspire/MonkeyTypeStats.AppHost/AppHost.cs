var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres").WithPgAdmin();

var db = postgres.AddDatabase("monkeytype-stats-db");

var api = builder
    .AddProject<Projects.MonkeyTypeStats_Api>("monkeytype-stats-api")
    .WithReference(db);

var frontend = builder.AddViteApp("monkeytype-stats-frontend", "../../frontend").WithReference(api);

builder.Build().Run();
