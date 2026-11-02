# Security Policy

## Supported versions

Only the latest release receives security fixes. Please update to the latest version before reporting an issue.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report vulnerabilities privately through GitHub: go to the [Security tab](https://github.com/kovacsgellert/monkeytype-stats/security) of this repository and click **Report a vulnerability**.

Please include:

- a description of the issue and its impact
- steps to reproduce, or a proof of concept
- the version (image tag) you are running

You can expect an initial response within a week. Once a fix is released, the advisory will be published with credit to the reporter (unless you prefer to stay anonymous).

## Scope

This project is a self-hosted tool. Issues caused by running it with `MONKEYTYPE_STATS_AUTH_ENABLED=false` on a publicly reachable host, or by leaking your own `.env` values, are out of scope.

MonkeyType Stats is an unofficial project and is not affiliated with MonkeyType. Vulnerabilities in MonkeyType itself should be reported to the MonkeyType team.
