using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Profile.GetLeaderboardHistory;

public static class GetLeaderboardHistoryEndpoint
{
    public static WebApplication MapGetLeaderboardHistoryEndpoint(this WebApplication app)
    {
        app.MapGet(
                "/api/monkeytype/leaderboards/history",
                async (string? language, string? mode, string? mode2, IMediator mediator) =>
                {
                    var result = await mediator.Send(
                        new GetLeaderboardHistoryQuery(
                            language ?? "english",
                            mode ?? "time",
                            mode2 ?? "60"
                        )
                    );
                    return result.ToResult();
                }
            )
            .WithName("GetLeaderboardHistory");

        return app;
    }
}
