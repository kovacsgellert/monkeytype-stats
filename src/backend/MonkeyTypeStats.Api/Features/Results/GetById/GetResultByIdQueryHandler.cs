using MediatR;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.Results;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;

namespace MonkeyTypeStats.Api.Features.Results.GetById;

public class GetResultByIdQueryHandler(
    MonkeyTypeStatsDbContext dbContext,
    MonkeyTypeApiClient monkeyTypeApiClient
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

        var apiResponse = await monkeyTypeApiClient.GetResultByIdAsync(request.Id);
        var details = apiResponse.ParsedResponse.Data;
        if (details is null)
        {
            return OperationResult<ResultDetailsDto>.Error(
                $"Result details with id '{request.Id}' not found."
            );
        }

        if (!await dbContext.ResultDetails.AnyAsync(r => r.Id == details.Id, cancellationToken))
        {
            var responseLog = new MonkeyTypeApiResponseLog
            {
                Id = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                Endpoint = $"/results/id/{details.Id}",
                Data = apiResponse.RawResponse,
            };

            dbContext.MonkeyTypeApiResponseLog.Add(responseLog);

            var newDetail = details.ToResultDetailEntity();

            dbContext.ResultDetails.Add(newDetail);
            await dbContext.SaveChangesAsync(cancellationToken);

            return OperationResult<ResultDetailsDto>.Ok(newDetail.ToResultDetailsDto());
        }

        return OperationResult<ResultDetailsDto>.Error(
            $"Result details with id '{request.Id}' not found."
        );
    }
}
