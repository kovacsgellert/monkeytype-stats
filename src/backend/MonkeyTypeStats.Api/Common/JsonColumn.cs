using System.Text.Json;

namespace MonkeyTypeStats.Api.Common;

// Helpers for jsonb columns that are stored as strings and exposed as JSON in DTOs
public static class JsonColumn
{
    public static JsonElement Parse(string json)
    {
        using var document = JsonDocument.Parse(json);
        return document.RootElement.Clone();
    }

    public static JsonElement? ParseOrNull(string? json) => json is null ? null : Parse(json);

    public static string Serialize(JsonElement element) => element.GetRawText();

    public static string? SerializeOrNull(JsonElement? element) =>
        element is null || element.Value.ValueKind == JsonValueKind.Null
            ? null
            : element.Value.GetRawText();
}
