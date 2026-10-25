using System.Text.Json;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.Goals.Common;

public static class GoalMappers
{
    public const int MaxTitleLength = 100;
    public const int MaxWindowSize = 1000;

    // progress for every type is computed by the frontend; the backend only stores the goal
    public static readonly string[] GoalTypes =
    [
        "form",
        "personal-best",
        "accuracy",
        "practice-volume",
        "streak",
        "leaderboard",
    ];

    public static GoalDto ToDto(this Goal goal) =>
        new(
            goal.Id,
            goal.Type,
            goal.Title,
            JsonColumn.ParseOrNull(goal.Filter),
            goal.Target,
            goal.WindowSize,
            goal.Deadline,
            goal.StartedAt,
            goal.AchievedAt,
            goal.ArchivedAt,
            goal.CreatedAt,
            goal.UpdatedAt
        );

    public static List<string> Validate(this SaveGoalRequest request)
    {
        var errors = new List<string>();

        if (!GoalTypes.Contains(request.Type))
            errors.Add($"Type must be one of: {string.Join(", ", GoalTypes)}.");

        if (string.IsNullOrWhiteSpace(request.Title))
            errors.Add("Title is required.");
        else if (request.Title.Trim().Length > MaxTitleLength)
            errors.Add($"Title must be at most {MaxTitleLength} characters.");

        if (!double.IsFinite(request.Target) || request.Target <= 0)
            errors.Add("Target must be a positive number.");
        else if (request.Type == "accuracy" && request.Target > 100)
            errors.Add("Accuracy target must be at most 100.");

        if (request.WindowSize is < 1 or > MaxWindowSize)
            errors.Add($"Window size must be between 1 and {MaxWindowSize}.");

        if (
            request.Filter is { } filter
            && filter.ValueKind is not (JsonValueKind.Object or JsonValueKind.Null)
        )
            errors.Add("Filter must be a JSON object.");

        return errors;
    }

    public static void Apply(this Goal goal, SaveGoalRequest request)
    {
        goal.Type = request.Type;
        goal.Title = request.Title.Trim();
        goal.Filter = JsonColumn.SerializeOrNull(request.Filter);
        goal.Target = request.Target;
        goal.WindowSize = request.WindowSize;
        goal.Deadline = request.Deadline.ToUtc();
        goal.AchievedAt = request.AchievedAt.ToUtc();
        goal.ArchivedAt = request.ArchivedAt.ToUtc();
        if (request.StartedAt is not null)
            goal.StartedAt = request.StartedAt.Value.ToUtc();
    }
}
