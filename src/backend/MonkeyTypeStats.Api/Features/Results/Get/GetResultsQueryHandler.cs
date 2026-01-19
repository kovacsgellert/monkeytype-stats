using MediatR;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;
using MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

namespace MonkeyTypeStats.Api.Features.Results.Get;

public class GetResultsQueryHandler(MonkeyTypeApiClient monkeyTypeApiClient)
    : IRequestHandler<GetResultsQuery, MonkeyTypeResultsResponse>
{
    public async Task<MonkeyTypeResultsResponse> Handle(
        GetResultsQuery request,
        CancellationToken cancellationToken
    )
    {
        return await monkeyTypeApiClient.GetResultsAsync();
    }
}
