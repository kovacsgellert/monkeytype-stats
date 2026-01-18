using MediatR;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;
using MonkeyTypeStats.Api.Queries;
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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.MapGet("/api/results", async (IMediator mediator) => await mediator.Send(new GetResultsQuery()))
    .WithName("GetResults");

app.Run();
