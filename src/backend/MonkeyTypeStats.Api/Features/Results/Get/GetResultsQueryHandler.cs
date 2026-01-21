using MediatR;
using MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;
using MonkeyTypeStats.Api.Services;

namespace MonkeyTypeStats.Api.Features.Results.Get;

public class GetResultsQueryHandler(ResultsFileService resultsFileService)
    : IRequestHandler<GetResultsQuery, MonkeyTypeResultsResponse?>
{
    public async Task<MonkeyTypeResultsResponse?> Handle(
        GetResultsQuery request,
        CancellationToken cancellationToken
    )
    {
        return await resultsFileService.GetLatestResultsAsync();
    }
}
