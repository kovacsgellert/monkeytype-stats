using MediatR;
using MonkeyTypeStats.Api.Common;

namespace MonkeyTypeStats.Api.Features.Settings.AppVersion;

public record GetAppVersionQuery : IRequest<OperationResult<AppVersionDto>>;
