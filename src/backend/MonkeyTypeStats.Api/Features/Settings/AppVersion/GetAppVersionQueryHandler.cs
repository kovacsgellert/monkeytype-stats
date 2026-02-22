using MediatR;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Services;

namespace MonkeyTypeStats.Api.Features.Settings.AppVersion;

public class GetAppVersionQueryHandler(AppVersionProvider appVersionProvider)
    : IRequestHandler<GetAppVersionQuery, OperationResult<AppVersionDto>>
{
    public Task<OperationResult<AppVersionDto>> Handle(
        GetAppVersionQuery request,
        CancellationToken cancellationToken
    )
    {
        var version = appVersionProvider.GetVersion();
        return Task.FromResult(OperationResult<AppVersionDto>.Ok(new AppVersionDto(version)));
    }
}
