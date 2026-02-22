using System.Reflection;

namespace MonkeyTypeStats.Api.Services;

public class AppVersionProvider
{
    private const string DefaultVersion = "0.0.0";

    public string GetVersion()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var version = assembly
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()
            ?.InformationalVersion;

        if (string.IsNullOrWhiteSpace(version))
        {
            version = assembly.GetName().Version?.ToString();
        }

        return string.IsNullOrWhiteSpace(version) ? DefaultVersion : version;
    }
}
