import Bolt from "@slack/bolt";
import { invariant, warn } from "./utils";

const botToken = process.env.SLACK_BOT_TOKEN;
invariant(botToken, "SLACK_BOT_TOKEN is required");

const signingSecret = process.env.SLACK_SIGNING_SECRET;
invariant(signingSecret, "SLACK_SIGNING_SECRET is required");

const appToken = process.env.SLACK_APP_TOKEN;
invariant(appToken, "SLACK_APP_TOKEN is required");

const channelEmoji = process.env.SLACK_CHANNEL_EMOJI;
warn(channelEmoji, "SLACK_CHANNEL_EMOJI is not set, emoji papertrail disabled");

const channelChannels = process.env.SLACK_CHANNEL_CHANNELS;
warn(
  channelChannels,
  "SLACK_CHANNEL_CHANNELS is not set, channel papertrail disabled",
);

const app = new Bolt.App({
  token: botToken,
  signingSecret,
  socketMode: true,
  appToken,
});

app.event("emoji_changed", async ({ event }) => {
  console.log("Received emoji_changed event", event);
  if (!channelEmoji) return;

  // Slack exposes both a name and names, and seems to use both in different contexts
  const names = Array.from(
    new Set([event.name, ...(event.names || [])]),
  ).filter(Boolean);

  // Aliases
  if (event.subtype === "add" && event.value?.startsWith("alias:")) {
    const alias = event.value.slice(6);
    await app.client.chat.postMessage({
      channel: channelEmoji,
      text: names
        .map(
          (name) =>
            `:linked_paperclips: :${name}: \`:${name}:\` \`:${alias}:\``,
        )
        .join("\n"),
      mrkdwn: true,
    });
    return;
  }

  // Removals
  if (event.subtype === "remove") {
    await app.client.chat.postMessage({
      channel: channelEmoji,
      text: names.map((name) => `:heavy_minus_sign: \`:${name}:\``).join("\n"),
      mrkdwn: true,
    });
    return;
  }

  // Additions
  await app.client.chat.postMessage({
    channel: channelEmoji,
    text: names
      .map((name) => `:heavy_plus_sign: :${name}: \`:${name}:\``)
      .join("\n"),
    mrkdwn: true,
  });
});

app.event("channel_created", async ({ event }) => {
  console.log("Received channel_created event", event);
  if (!channelChannels) return;

  await app.client.chat.postMessage({
    channel: channelChannels,
    text: `Channel created: ${event.channel.name}`,
  });
});

app.event("channel_unarchive", async ({ event }) => {
  console.log("Received channel_unarchive event", event);
  if (!channelChannels) return;

  await app.client.chat.postMessage({
    channel: channelChannels,
    text: `Channel unarchived: ${event.channel}`,
  });
});

(async () => {
  await app.start();
  console.log("Papertrail is running!");
})();
