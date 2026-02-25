using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Results.Import;

public class ImportResultsCommandHandler(ImportResultsJob importResultsJob)
    : IRequestHandler<ImportResultsCommand, OperationResult<ImportResultsResponse>>
{
    public async Task<OperationResult<ImportResultsResponse>> Handle(
        ImportResultsCommand request,
        CancellationToken cancellationToken
    )
    {
        var resultsAdded = await importResultsJob.ExecuteWithResultAsync();
        return OperationResult<ImportResultsResponse>.Ok(new ImportResultsResponse(resultsAdded));
    }
}
