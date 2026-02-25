using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Results.Import;

public record ImportResultsCommand : IRequest<OperationResult<ImportResultsResponse>>;
