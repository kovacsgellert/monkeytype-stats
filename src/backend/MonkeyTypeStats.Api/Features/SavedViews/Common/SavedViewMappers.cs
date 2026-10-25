using System.Text.Json;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.SavedViews.Common;

public static class SavedViewMappers
{
    public const int MaxNameLength = 100;

    public static SavedViewDto ToDto(this SavedView savedView) =>
        new(
            savedView.Id,
            savedView.Name,
            JsonColumn.Parse(savedView.Filter),
            savedView.SortOrder,
            savedView.CreatedAt,
            savedView.UpdatedAt
        );

    public static List<string> Validate(this SaveSavedViewRequest request)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(request.Name))
            errors.Add("Name is required.");
        else if (request.Name.Trim().Length > MaxNameLength)
            errors.Add($"Name must be at most {MaxNameLength} characters.");

        if (request.Filter.ValueKind != JsonValueKind.Object)
            errors.Add("Filter must be a JSON object.");

        return errors;
    }
}
