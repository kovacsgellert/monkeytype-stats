# monkeytype-stats

Unofficial MonkeyType test result exporter and dashboard.

## Why?

The built-in MonkeyType dashboard is limited to showing the latest 1000 results of a user. As far as my understanding goes, MonkeyType simply deletes any old result that falls out of this range, which makes it impossible to track long-term typing stats progress in case of active users.

The main goals of this project are:

- save my old MonkeyType results from disappearing
- enable deeper analysis of my typing stats
- learn about .NET Aspire in a fun way

## Features

- Scheduled job that runs once every day and imports all new results from the MonkeyType API with ApeKey authentication.
- Filtering results by Timestamp, Mode (including Mode2).
- Summary view showing highlights of all/filtered results.
- Table view showing the list of all/filtered results.
- Graph view showing speed/accuracy/consistency evolution over time (including rolling averages of latest 10 and 100 results).

### Upcoming

- JSON export/import capability.
- Get and display details of a result (WPM graph of a single result).
- Activity heat-map (similar to the one on MonkeyType Account page).
- More stats calculated based on the results.

## Deployment guide

TBD

## AI usage disclosure

The frontend was pretty much 100% vibe-coded.
I'm a backend guy with mainly .NET experience, so my knowledge of React and Tailwind CSS is pretty limited at the time of writing.
