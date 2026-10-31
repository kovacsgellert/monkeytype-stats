using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Features.Profile.Import;

namespace MonkeyTypeStats.Api.Features.Results.Import;

public class ImportResultsCommandHandler(
    ImportResultsJob importResultsJob,
    ImportMonkeyTypeProfileJob importMonkeyTypeProfileJob,
    ILogger<ImportResultsCommandHandler> logger
) : IRequestHandler<ImportResultsCommand, OperationResult<ImportResultsResponse>>
{
    public async Task<OperationResult<ImportResultsResponse>> Handle(
        ImportResultsCommand request,
        CancellationToken cancellationToken
    )
    {
        int resultsAdded;
        try
        {
            resultsAdded = await importResultsJob.ExecuteWithResultAsync();
        }
        catch (HttpRequestException ex)
            when (ex.StatusCode == ImportResultsJob.RateLimitedStatusCode)
        {
            logger.LogWarning(ex, "Manual MonkeyType results import was rate limited");
            return OperationResult<ImportResultsResponse>.Error(
                "MonkeyType's API rate limit was reached. Please try again later."
            );
        }

        // a failed profile import should not hide the results that were imported
        bool profileImported;
        try
        {
            profileImported = await importMonkeyTypeProfileJob.ExecuteWithResultAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Manual MonkeyType profile import failed");
            profileImported = false;
        }

        return OperationResult<ImportResultsResponse>.Ok(
            new ImportResultsResponse(resultsAdded, profileImported)
        );
    }
}
