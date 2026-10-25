using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Profile.GetLeaderboardHistory;

public record GetLeaderboardHistoryQuery(string Language, string Mode, string Mode2)
    : IRequest<OperationResult<List<LeaderboardHistoryPointDto>>>;
