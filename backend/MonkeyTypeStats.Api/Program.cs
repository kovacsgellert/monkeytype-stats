using MonkeyTypeStats.Api.MonkeyTypeIntegration;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var monkeyTypeApiConfig = builder.Configuration.GetSection("MonkeyTypeApi");

builder.Services.AddHttpClient<MonkeyTypeApiClient>(client =>
{
    client.BaseAddress = new Uri(monkeyTypeApiConfig["BaseUrl"]!);
    client.DefaultRequestHeaders.Add("Authorization", $"ApeKey {monkeyTypeApiConfig["ApeKey"]}");
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.MapGet(
        "/api/results",
        async (MonkeyTypeApiClient monkeyTypeApiClient) =>
            await monkeyTypeApiClient.GetResultsAsync()
    )
    .WithName("GetStats");

app.Run();
