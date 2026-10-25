using System.Text.Json;

namespace MonkeyTypeStats.Api.Features.SavedViews.Common;

public record SaveSavedViewRequest(string Name, JsonElement Filter, int? SortOrder);
