using System.Text.Json;

namespace MonkeyTypeStats.Api.Features.Goals.Common;

public record GoalDto(
    Guid Id,
    string Type,
    string Title,
    JsonElement? Filter,
    double Target,
    int? WindowSize,
    DateTime? Deadline,
    DateTime StartedAt,
    DateTime? AchievedAt,
    DateTime? ArchivedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
