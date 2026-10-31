using MediatR;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;

namespace MonkeyTypeStats.Api.Features.Results.GetById;

public class GetResultByIdQueryHandler(
    MonkeyTypeStatsDbContext dbContext,
    MonkeyTypeApiClient monkeyTypeApiClient,
    MonkeyTypeApiResponseLogger responseLogger
) : IRequestHandler<GetResultByIdQuery, OperationResult<ResultDetailsDto>>
{
    public async Task<OperationResult<ResultDetailsDto>> Handle(
        GetResultByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var resultDetail = await dbContext
            .ResultDetails.Where(r => r.Id == request.Id)
            .SelectResultDetailsDtos()
            .FirstOrDefaultAsync(cancellationToken);

        if (resultDetail is not null)
        {
            return OperationResult<ResultDetailsDto>.Ok(resultDetail);
        }

        // this endpoint is public, so only call MonkeyType (with the ApeKey) for imported results;
        // that also keeps arbitrary ids out of the MonkeyType request path and the response log
        if (!await dbContext.Results.AnyAsync(r => r.Id == request.Id, cancellationToken))
        {
            return OperationResult<ResultDetailsDto>.Error(
                $"Result with id '{request.Id}' not found."
            );
        }

        var response = await monkeyTypeApiClient.GetResultByIdAsync(request.Id);

        // saved on every path, so the hourly details job knows this result was already fetched
        await responseLogger.AddIfChangedAsync(
            $"/results/id/{request.Id}",
            response.RawResponse,
            cancellationToken
        );

        var details = response.ParsedResponse.Data;
        if (details is null)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return OperationResult<ResultDetailsDto>.Error(
                $"Result details with id '{request.Id}' not found."
            );
        }

        if (!await dbContext.ResultDetails.AnyAsync(r => r.Id == details.Id, cancellationToken))
        {
            var newResultDetail = details.ToResultDetailEntity();

            dbContext.ResultDetails.Add(newResultDetail);
            await dbContext.SaveChangesAsync(cancellationToken);

            return OperationResult<ResultDetailsDto>.Ok(newResultDetail.ToResultDetailsDto());
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return OperationResult<ResultDetailsDto>.Error(
            $"Result details with id '{request.Id}' not found."
        );
    }
}
