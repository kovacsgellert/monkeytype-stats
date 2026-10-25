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
        var resultsAdded = await importResultsJob.ExecuteWithResultAsync();

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
