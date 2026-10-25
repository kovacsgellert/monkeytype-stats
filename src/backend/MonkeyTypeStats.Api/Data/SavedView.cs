namespace MonkeyTypeStats.Api.Data;

public class SavedView
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // JSON object holding the Explorer filter, owned by the frontend
    public string Filter { get; set; } = "{}";
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
