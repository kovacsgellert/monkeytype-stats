using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Version.Get;

public record GetAppVersionQuery : IRequest<OperationResult<AppVersionDto>>;
