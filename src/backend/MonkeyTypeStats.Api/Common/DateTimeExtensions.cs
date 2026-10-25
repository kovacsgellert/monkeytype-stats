namespace MonkeyTypeStats.Api.Common;

public static class DateTimeExtensions
{
    // Npgsql only accepts UTC values for timestamp with time zone columns
    public static DateTime ToUtc(this DateTime value) =>
        value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        };

    public static DateTime? ToUtc(this DateTime? value) => value?.ToUtc();
}
