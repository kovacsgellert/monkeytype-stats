using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.MonkeyTypeIntegration;

public class MonkeyTypeApiResponseLogger
{
    private readonly MonkeyTypeStatsDbContext _dbContext;

    public MonkeyTypeApiResponseLogger(MonkeyTypeStatsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Adds the response to the log unless its data is identical to the latest logged response
    /// for the same endpoint. The caller saves the changes.
    /// </summary>
    public async Task<bool> AddIfChangedAsync(
        string endpoint,
        string rawResponse,
        CancellationToken cancellationToken = default
    )
    {
        var latestLoggedResponse = await _dbContext
            .MonkeyTypeApiResponseLog.Where(log => log.Endpoint == endpoint)
            .OrderByDescending(log => log.Timestamp)
            .Select(log => log.Data)
            .FirstOrDefaultAsync(cancellationToken);

        // jsonb does not preserve key order, so compare parsed data instead of raw strings
        if (
            latestLoggedResponse is not null
            && JsonNode.DeepEquals(GetData(latestLoggedResponse), GetData(rawResponse))
        )
        {
            return false;
        }

        _dbContext.MonkeyTypeApiResponseLog.Add(
            new MonkeyTypeApiResponseLog
            {
                Id = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                Endpoint = endpoint,
                Data = rawResponse,
            }
        );

        return true;
    }

    /// <summary>
    /// Logs an error response, so callers that use the log to skip already attempted endpoints
    /// do not retry it. Bodies that are not a JSON object are wrapped, because the column is jsonb.
    /// The caller saves the changes.
    /// </summary>
    public Task<bool> AddErrorIfChangedAsync(
        MonkeyTypeApiException exception,
        CancellationToken cancellationToken = default
    )
    {
        var data = IsJsonObject(exception.Content)
            ? exception.Content
            : JsonSerializer.Serialize(
                new
                {
                    statusCode = (int?)exception.StatusCode,
                    message = exception.Content,
                    data = (object?)null,
                }
            );

        return AddIfChangedAsync(exception.Endpoint, data, cancellationToken);
    }

    private static JsonNode? GetData(string json) => JsonNode.Parse(json)?["data"];

    private static bool IsJsonObject(string json)
    {
        try
        {
            return JsonNode.Parse(json) is JsonObject;
        }
        catch (JsonException)
        {
            return false;
        }
    }
}
