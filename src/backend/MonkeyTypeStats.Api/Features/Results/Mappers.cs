using System.Linq.Expressions;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.Results.Get;
using MonkeyTypeStats.Api.Features.Results.GetById;
using MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

namespace MonkeyTypeStats.Api.Features.Results;

public static class Mappers
{
    private static readonly Expression<Func<Result, ResultDto>> ResultToDtoExpression =
        result => new ResultDto(
            result.Id,
            result.Wpm,
            result.RawWpm,
            result.CharStats,
            result.Acc,
            result.Mode,
            result.Mode2,
            result.QuoteLength,
            result.Timestamp,
            result.TestDuration,
            result.Consistency,
            result.KeyConsistency,
            result.Uid,
            result.RestartCount,
            result.IncompleteTestSeconds,
            result.AfkDuration,
            result.Tags,
            result.BailedOut,
            result.BlindMode,
            result.LazyMode,
            result.Funbox,
            result.Language,
            result.Difficulty,
            result.Numbers,
            result.Punctuation,
            result.IsPb
        );

    private static readonly Expression<
        Func<ResultDetail, ResultDetailsDto>
    > ResultDetailToDtoExpression = detail => new ResultDetailsDto(
        detail.Id,
        detail.Wpm,
        detail.RawWpm,
        detail.CharStats,
        detail.Acc,
        detail.Mode,
        detail.Mode2,
        detail.QuoteLength,
        detail.Timestamp,
        detail.TestDuration,
        detail.Consistency,
        detail.KeyConsistency,
        detail.Uid,
        detail.RestartCount,
        detail.IncompleteTestSeconds,
        detail.AfkDuration,
        detail.Tags,
        detail.BailedOut,
        detail.BlindMode,
        detail.LazyMode,
        detail.Funbox,
        detail.Language,
        detail.Difficulty,
        detail.Numbers,
        detail.Punctuation,
        detail.IsPb,
        detail.ChartWpm,
        detail.ChartBurst,
        detail.ChartErr,
        detail.KeySpacingAverage,
        detail.KeySpacingSd,
        detail.KeyDurationAverage,
        detail.KeyDurationSd,
        detail.Name
    );

    public static IQueryable<ResultDto> SelectResultDtos(this IQueryable<Result> query)
    {
        return query.Select(ResultToDtoExpression);
    }

    public static IQueryable<ResultDetailsDto> SelectResultDetailsDtos(
        this IQueryable<ResultDetail> query
    )
    {
        return query.Select(ResultDetailToDtoExpression);
    }

    public static ResultDto ToResultDto(this Result result)
    {
        return new ResultDto(
            result.Id,
            result.Wpm,
            result.RawWpm,
            result.CharStats,
            result.Acc,
            result.Mode,
            result.Mode2,
            result.QuoteLength,
            result.Timestamp,
            result.TestDuration,
            result.Consistency,
            result.KeyConsistency,
            result.Uid,
            result.RestartCount,
            result.IncompleteTestSeconds,
            result.AfkDuration,
            result.Tags,
            result.BailedOut,
            result.BlindMode,
            result.LazyMode,
            result.Funbox,
            result.Language,
            result.Difficulty,
            result.Numbers,
            result.Punctuation,
            result.IsPb
        );
    }

    public static ResultDetailsDto ToResultDetailsDto(this ResultDetail detail)
    {
        return new ResultDetailsDto(
            detail.Id,
            detail.Wpm,
            detail.RawWpm,
            detail.CharStats,
            detail.Acc,
            detail.Mode,
            detail.Mode2,
            detail.QuoteLength,
            detail.Timestamp,
            detail.TestDuration,
            detail.Consistency,
            detail.KeyConsistency,
            detail.Uid,
            detail.RestartCount,
            detail.IncompleteTestSeconds,
            detail.AfkDuration,
            detail.Tags,
            detail.BailedOut,
            detail.BlindMode,
            detail.LazyMode,
            detail.Funbox,
            detail.Language,
            detail.Difficulty,
            detail.Numbers,
            detail.Punctuation,
            detail.IsPb,
            detail.ChartWpm,
            detail.ChartBurst,
            detail.ChartErr,
            detail.KeySpacingAverage,
            detail.KeySpacingSd,
            detail.KeyDurationAverage,
            detail.KeyDurationSd,
            detail.Name
        );
    }

    public static Result ToResultEntity(this TestResult apiResult)
    {
        return new Result
        {
            Id = apiResult.Id,
            Wpm = apiResult.Wpm,
            RawWpm = apiResult.RawWpm,
            CharStats = apiResult.CharStats,
            Acc = apiResult.Acc,
            Mode = apiResult.Mode,
            Mode2 = apiResult.Mode2,
            QuoteLength = apiResult.QuoteLength,
            Timestamp = DateTimeOffset.FromUnixTimeMilliseconds(apiResult.Timestamp).UtcDateTime,
            TestDuration = apiResult.TestDuration,
            Consistency = apiResult.Consistency,
            KeyConsistency = apiResult.KeyConsistency,
            Uid = apiResult.Uid,
            RestartCount = apiResult.RestartCount,
            IncompleteTestSeconds = apiResult.IncompleteTestSeconds,
            AfkDuration = apiResult.AfkDuration,
            Tags = apiResult.Tags,
            BailedOut = apiResult.BailedOut,
            BlindMode = apiResult.BlindMode,
            LazyMode = apiResult.LazyMode,
            Funbox = apiResult.Funbox,
            Language = apiResult.Language,
            Difficulty = apiResult.Difficulty,
            Numbers = apiResult.Numbers,
            Punctuation = apiResult.Punctuation,
            IsPb = apiResult.IsPb,
        };
    }

    public static ResultDetail ToResultDetailEntity(this TestResultDetails details)
    {
        return new ResultDetail
        {
            Id = details.Id,
            Wpm = details.Wpm,
            RawWpm = details.RawWpm,
            CharStats = details.CharStats ?? [],
            Acc = details.Acc,
            Mode = details.Mode,
            Mode2 = details.Mode2,
            QuoteLength = details.QuoteLength,
            Timestamp = DateTimeOffset.FromUnixTimeMilliseconds(details.Timestamp).UtcDateTime,
            TestDuration = details.TestDuration,
            Consistency = details.Consistency,
            KeyConsistency = details.KeyConsistency,
            Uid = details.Uid,
            RestartCount = details.RestartCount,
            IncompleteTestSeconds = details.IncompleteTestSeconds,
            AfkDuration = details.AfkDuration,
            Tags = details.Tags,
            BailedOut = details.BailedOut,
            BlindMode = details.BlindMode,
            LazyMode = details.LazyMode,
            Funbox = details.Funbox,
            Language = details.Language,
            Difficulty = details.Difficulty,
            Numbers = details.Numbers,
            Punctuation = details.Punctuation,
            IsPb = details.IsPb,
            ChartWpm = details.ChartData?.Wpm,
            ChartBurst = details.ChartData?.Burst,
            ChartErr = details.ChartData?.Err,
            KeySpacingAverage = details.KeySpacingStats?.Average,
            KeySpacingSd = details.KeySpacingStats?.Sd,
            KeyDurationAverage = details.KeyDurationStats?.Average,
            KeyDurationSd = details.KeyDurationStats?.Sd,
            Name = details.Name,
        };
    }
}
