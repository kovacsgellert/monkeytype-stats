using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Results.Get;

public record GetResultsQuery : IRequest<OperationResult<List<ResultDto>>>;
