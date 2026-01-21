using MediatR;
using MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

namespace MonkeyTypeStats.Api.Features.Results.Get;

public record GetResultsQuery : IRequest<MonkeyTypeResultsResponse?>;
