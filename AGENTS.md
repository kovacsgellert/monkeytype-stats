# Agent rules

## .NET local tools

- tools are pinned in `.config/dotnet-tools.json` and auto-restored on build (see `Directory.Build.targets`)
- invoke them via `dotnet <command>` (e.g. `dotnet csharpier`), never bare `csharpier`

## .cs rules

- after changing .cs files always run `dotnet csharpier format .` in the repo root

## .csproj rules

- after changing .csproj files always run `dotnet csharpier format .` in the repo root

## Frontend API rules

- for api requests from the frontend always use Tanstack Query
