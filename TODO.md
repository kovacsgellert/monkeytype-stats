# Tasks

## DONE ✅

- implement page with table view
- implement graphs showing speed and accuracy change
- implement get result details by id endpoint
  - if result detail does not exist in DB, fetch it from MonkeyType API and save it
  - do not repeatedly try to fetch details for very old results, they may have been already deleted by MonkeyType
- show result detail graphs in the frontend
- implement backup/restore functionality
  - backup should be a huge JSON that contains both results and result details, maybe zipped for convenience
  - restore should accept an exported JSON and correctly populate the database
- add a Tools/Settings page to expose backup/restore and maybe other settings?
  - make it possible to trigger the ImportResultsJob from the Settings page
- create docker compose setup to run solution locally
- build and push containers to GHCR
- deploy to homelab
- add backend and frontend version info to the Settings page
- settings endpoints should use some kind of auth
- fix OTEL logging on backend and postgres (nothing's showing up in the Aspire Dashboard)
- create and add icon to the frontend
- expose as subdomain of [kovacsgellert.dev](https://kovacsgellert.dev)
  - [typing.kovacsgellert.dev](https://typing.kovacsgellert.dev)
- add link on my blog pointing to monkeytype-stats

## TO DO 🔨

- chore: update screenshots in README
- chore: update postgres and other container versions to latest in the docker-compose file
- feat: implement heat-map similar to MonkeyType original
- feat: come up with a better way of versioning the container images (one source of truth, reused)
- feat: standardize error API error response structure and frontend error handling/display
- feat: add an about page with links to my blog, github and linkedin (can be disabled with an env var)
- feat: add OTEL logging to frontend
- feat: set up Hangfire Postgres storage
- feat: show Hangfire job status and stats on the Settings page
- feat: implement a DI based way registering API endpoints (Program.cs should only contain something like app.MapApiEndpoints() which should find and add all of them)
- chore: general code cleanup
- feat: make the frontend mobile friendly
