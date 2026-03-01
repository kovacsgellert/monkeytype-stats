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

## TO DO 🔨

- implement heat-map similar to MonkeyType original
- come up with a better way of versioning the containers
- standardize error API error response structure and frontend error handling/display
- add an about page with links to my blog, github and linkedin (can be disabled with an env var)
- add OTEL logging to frontend
- set up Hangfire Postgres storage
- show Hangfire job status and stats on the Settings page
- implement a DI based way registering API endpoints (Program.cs should only contain something like app.MapApiEndpoints() which should find and add all of them)
- general code cleanup
- make the frontend mobile friendly
- expose as subdomain of [kovacsgellert.dev](https://kovacsgellert.dev)
- add link on my blog pointing to monkeytype-stats
