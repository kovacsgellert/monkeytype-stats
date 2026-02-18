# Tasks

## Dev

- implement page with table view ✅
- implement graphs showing speed and accuracy change ✅
- implement heat-map similar to MonkeyType original
- implement get result details by id endpoint
  - if result detail does not exist in DB, fetch it from MonkeyType API and save it
- implement scheduled job to populate missing result details
- show result detail graphs in the frontend
- implement backup/restore functionality
  - backup should be a huge JSON that contains both results and result details, maybe zipped for convenience
  - restore should accept an exported JSON and correctly populate the database

## DevOps

- create docker compose setup to run solution locally
- build and push containers to GHCR
- deploy to homelab
- expose as subdomain of kovacsgellert.dev
- add link to blog
