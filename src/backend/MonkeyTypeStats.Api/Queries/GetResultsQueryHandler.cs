using MediatR;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;
using MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

namespace MonkeyTypeStats.Api.Queries;

public class GetResultsQueryHandler(MonkeyTypeApiClient monkeyTypeApiClient)
    : IRequestHandler<GetResultsQuery, GetResultsResponse>
{
    public async Task<GetResultsResponse> Handle(
        GetResultsQuery request,
        CancellationToken cancellationToken
    )
    {
        return await monkeyTypeApiClient.GetResultsAsync();
    }
}
