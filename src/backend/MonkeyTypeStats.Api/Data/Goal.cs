namespace MonkeyTypeStats.Api.Data;

public class Goal
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;

    // JSON object holding the result filter the goal applies to, owned by the frontend
    public string? Filter { get; set; }
    public double Target { get; set; }
    public int? WindowSize { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? AchievedAt { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
