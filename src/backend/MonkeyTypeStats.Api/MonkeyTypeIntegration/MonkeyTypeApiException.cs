using System.Net;

namespace MonkeyTypeStats.Api.MonkeyTypeIntegration;

/// <summary>
/// A non-success response from the MonkeyType API, with the response body kept for logging.
/// </summary>
public class MonkeyTypeApiException(string endpoint, HttpStatusCode statusCode, string content)
    : HttpRequestException(
        $"MonkeyType API request to {endpoint} failed with status code {(int)statusCode}.",
        null,
        statusCode
    )
{
    public string Endpoint { get; } = endpoint;

    public string Content { get; } = content;
}
