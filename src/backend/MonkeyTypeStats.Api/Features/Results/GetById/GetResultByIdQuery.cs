using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Results.GetById;

public record GetResultByIdQuery(string Id) : IRequest<OperationResult<ResultDetailsDto>>;
