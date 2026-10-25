using System.Text.Json;

namespace MonkeyTypeStats.Api.Features.SavedViews.Common;

public record SavedViewDto(
    Guid Id,
    string Name,
    JsonElement Filter,
    int SortOrder,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
