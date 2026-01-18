using MediatR;
using MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

namespace MonkeyTypeStats.Api.Queries;

public record GetResultsQuery : IRequest<GetResultsResponse>;
