using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;
using MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

namespace MonkeyTypeStats.Api.Features.Profile.Import;

public class ImportMonkeyTypeProfileJob
{
    // MonkeyType only has all-time leaderboards for these
    private static readonly (string Language, string Mode, string Mode2)[] Leaderboards =
    [
        ("english", "time", "15"),
        ("english", "time", "60"),
    ];

    private static readonly string[] PersonalBestModes = ["time", "words"];

    private readonly MonkeyTypeApiClient _monkeyTypeApiClient;
    private readonly MonkeyTypeApiResponseLogger _responseLogger;
    private readonly MonkeyTypeStatsDbContext _dbContext;
    private readonly ILogger<ImportMonkeyTypeProfileJob> _logger;

    public ImportMonkeyTypeProfileJob(
        MonkeyTypeApiClient monkeyTypeApiClient,
        MonkeyTypeApiResponseLogger responseLogger,
        MonkeyTypeStatsDbContext dbContext,
        ILogger<ImportMonkeyTypeProfileJob> logger
    )
    {
        _monkeyTypeApiClient = monkeyTypeApiClient;
        _responseLogger = responseLogger;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        await ExecuteInternalAsync();
    }

    public Task<bool> ExecuteWithResultAsync()
    {
        return ExecuteInternalAsync();
    }

    private async Task<bool> ExecuteInternalAsync()
    {
        _logger.LogInformation("Starting daily MonkeyType profile import job");

        try
        {
            var capturedAt = DateTime.UtcNow;

            await ImportProfileSnapshotAsync(capturedAt);
            await ImportLeaderboardsAsync(capturedAt);
            await ImportPersonalBestsAsync(capturedAt);
            await ImportTagsAsync();

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation("Successfully imported MonkeyType profile data");
            return true;
        }
        catch (HttpRequestException ex) when (ex.StatusCode == (HttpStatusCode)479)
        {
            _logger.LogError(
                ex,
                "MonkeyType API rate limit exceeded (status code 479). Stopping profile import job."
            );
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to import MonkeyType profile data");
            throw;
        }
    }

    private async Task ImportProfileSnapshotAsync(DateTime capturedAt)
    {
        var statsResponse = await _monkeyTypeApiClient.GetUserStatsAsync();
        await LogResponseAsync(statsResponse);

        var streakResponse = await _monkeyTypeApiClient.GetStreakAsync();
        await LogResponseAsync(streakResponse);

        var stats = statsResponse.ParsedResponse.Data;
        var streak = streakResponse.ParsedResponse.Data;
        if (stats is null || streak is null)
        {
            _logger.LogWarning("User stats or streak response had no data");
            return;
        }

        _dbContext.ProfileSnapshots.Add(
            new ProfileSnapshot
            {
                Id = Guid.NewGuid(),
                CapturedAt = capturedAt,
                CompletedTests = stats.CompletedTests,
                StartedTests = stats.StartedTests,
                TimeTypingSeconds = stats.TimeTyping,
                StreakLength = streak.Length,
                MaxStreakLength = streak.MaxLength,
                LastResultTimestamp = ToDateTime(streak.LastResultTimestamp),
                StreakHourOffset = streak.HourOffset,
            }
        );
    }

    private async Task ImportLeaderboardsAsync(DateTime capturedAt)
    {
        foreach (var (language, mode, mode2) in Leaderboards)
        {
            LeaderboardRankData? rank = null;
            try
            {
                var rankResponse = await _monkeyTypeApiClient.GetLeaderboardRankAsync(
                    language,
                    mode,
                    mode2
                );
                await LogResponseAsync(rankResponse);
                rank = rankResponse.ParsedResponse.Data;
            }
            catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                _logger.LogInformation(
                    "User is not ranked on the {Language} {Mode} {Mode2} leaderboard",
                    language,
                    mode,
                    mode2
                );
            }

            var leaderboardResponse = await _monkeyTypeApiClient.GetLeaderboardAsync(
                language,
                mode,
                mode2
            );
            await LogResponseAsync(leaderboardResponse);

            _dbContext.LeaderboardSnapshots.Add(
                new LeaderboardSnapshot
                {
                    Id = Guid.NewGuid(),
                    CapturedAt = capturedAt,
                    Language = language,
                    Mode = mode,
                    Mode2 = mode2,
                    Rank = rank?.Rank,
                    FriendsRank = rank?.FriendsRank,
                    LeaderboardSize = leaderboardResponse.ParsedResponse.Data?.Count,
                    Wpm = rank?.Wpm,
                    Raw = rank?.Raw,
                    Acc = rank?.Acc,
                    Consistency = rank?.Consistency,
                    EntryTimestamp = ToDateTime(rank?.Timestamp),
                }
            );

            var histogramResponse = await _monkeyTypeApiClient.GetSpeedHistogramAsync(
                language,
                mode,
                mode2
            );
            await LogResponseAsync(histogramResponse);

            var histogram = histogramResponse.ParsedResponse.Data;
            if (histogram is null)
            {
                _logger.LogWarning(
                    "Speed histogram response for {Language} {Mode} {Mode2} had no data",
                    language,
                    mode,
                    mode2
                );
                continue;
            }

            _dbContext.SpeedHistogramSnapshots.Add(
                new SpeedHistogramSnapshot
                {
                    Id = Guid.NewGuid(),
                    CapturedAt = capturedAt,
                    Language = language,
                    Mode = mode,
                    Mode2 = mode2,
                    Buckets = JsonSerializer.Serialize(histogram),
                }
            );
        }
    }

    private async Task ImportPersonalBestsAsync(DateTime capturedAt)
    {
        var personalBests = new List<PersonalBest>();

        foreach (var mode in PersonalBestModes)
        {
            var response = await _monkeyTypeApiClient.GetPersonalBestsAsync(mode);
            await LogResponseAsync(response);

            var data = response.ParsedResponse.Data;
            if (data is null)
            {
                _logger.LogWarning("Personal bests response for {Mode} had no data", mode);
                // keep the existing personal bests instead of replacing them with a partial set
                return;
            }

            personalBests.AddRange(
                data.SelectMany(entry =>
                    entry.Value.Select(pb => new PersonalBest
                    {
                        Id = Guid.NewGuid(),
                        Mode = mode,
                        Mode2 = entry.Key,
                        Language = pb.Language,
                        Difficulty = pb.Difficulty,
                        Punctuation = pb.Punctuation,
                        Numbers = pb.Numbers,
                        LazyMode = pb.LazyMode,
                        Wpm = pb.Wpm,
                        Raw = pb.Raw,
                        Acc = pb.Acc,
                        Consistency = pb.Consistency,
                        Timestamp = DateTimeOffset
                            .FromUnixTimeMilliseconds(pb.Timestamp)
                            .UtcDateTime,
                        ImportedAt = capturedAt,
                    })
                )
            );
        }

        _dbContext.PersonalBests.RemoveRange(await _dbContext.PersonalBests.ToListAsync());
        _dbContext.PersonalBests.AddRange(personalBests);
    }

    private async Task ImportTagsAsync()
    {
        var response = await _monkeyTypeApiClient.GetTagsAsync();
        await LogResponseAsync(response);

        var tags = response.ParsedResponse.Data;
        if (tags is null)
        {
            _logger.LogWarning("Tags response had no data");
            return;
        }

        var existingTags = await _dbContext.Tags.ToDictionaryAsync(tag => tag.Id);
        var importedTagIds = tags.Select(tag => tag.Id).ToHashSet();

        foreach (var tag in tags)
        {
            if (existingTags.TryGetValue(tag.Id, out var existingTag))
                existingTag.Name = tag.Name;
            else
                _dbContext.Tags.Add(new Tag { Id = tag.Id, Name = tag.Name });
        }

        _dbContext.Tags.RemoveRange(
            existingTags.Values.Where(tag => !importedTagIds.Contains(tag.Id))
        );
    }

    private Task LogResponseAsync<T>(MonkeyTypeApiCallResult<T> response) =>
        _responseLogger.AddIfChangedAsync(response.Endpoint, response.RawResponse);

    private static DateTime? ToDateTime(long? unixMilliseconds) =>
        unixMilliseconds is null
            ? null
            : DateTimeOffset.FromUnixTimeMilliseconds(unixMilliseconds.Value).UtcDateTime;
}
