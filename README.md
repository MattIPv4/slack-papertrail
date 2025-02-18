# Slack Papertrail

Logs a papertrail of emoji creations + removals, as well as channel creations, to dedicated Slack channels.

## Getting Started

### Prerequisites

- Install [Node.js](https://nodejs.org/en/download/releases/) matching the version in [`.nvmrc`](.nvmrc) ([`fnm`](https://github.com/Schniz/fnm)/[`nvm`](https://github.com/nvm-sh/nvm) recommended)
- Install [Node.js dependencies](package.json) with `npm ci`
- Copy the `.env.example` file to `.env`

### Create a Slack app

- Head over to the [Slack API](https://api.slack.com/apps?new_app=1) and create a new app.
- Choose the "From scratch" option and give your app a name and choose the workspace you want to install it in.
- Access the app's permission settings and add the `chat:write` + `emoji:read` + `channels:read` bot scopes.
- Install the app to the workspace and set `SLACK_BOT_TOKEN` (in [`.env`](.env)) to the bot OAuth token generated.
- Access the app's basic information and set `SLACK_SIGNING_SECRET` (in [`.env`](.env)) to the signing secret for the app.
- Access and enable the app's socket mode, then set `SLACK_APP_TOKEN` (in [`.env`](.env)) to the generated app token.
- Access the app's event subscriptions and subscribe to the `emoji_changed` + `channel_created` + `channel_unarchive` bot events.

### Create Slack channels

`SLACK_CHANNEL_EMOJI` and `SLACK_CHANNEL_CHANNELS` (in [`.env`](.env)) should be set to the IDs of the Slack channels you want to log emoji and channel papertrails to. Both are optional and will not log to Slack if not set (both could also be the same channel if so desired).

Once a channel has been created in Slack, you can get its ID by copying the link and extracting the last part of the URL. With the channel(s) created, make sure to add the bot to the channel under the channel's integrations settings.

### Start the app

Run `npm start` to start the app. The app will listen for events from Slack and log them to the specified channels, as well as to the console.
