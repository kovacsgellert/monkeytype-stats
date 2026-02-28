using System.Text.Json;
using System.Text.Json.Serialization;

namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public class ChartDataJsonConverter : JsonConverter<ChartData?>
{
    public override ChartData? Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var value = reader.GetString();
            if (string.Equals(value, "toolong", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }
        }

        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        if (reader.TokenType != JsonTokenType.StartObject)
        {
            throw new JsonException("Expected chartData object or 'toolong' string.");
        }

        return JsonSerializer.Deserialize<ChartData>(ref reader, options);
    }

    public override void Write(
        Utf8JsonWriter writer,
        ChartData? value,
        JsonSerializerOptions options
    )
    {
        JsonSerializer.Serialize(writer, value, options);
    }
}
