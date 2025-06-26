import Bolt from "@slack/bolt";
import { invariant, warn, debug } from "./utils";

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

const send = (channel: string, text: string) =>
  app.client.chat
    .postMessage({
      channel,
      text,
      mrkdwn: true,
    })
    .catch((error) => {
      console.error("Failed to send message", { channel, text, error });
    });

app.event("emoji_changed", async ({ event }) => {
  debug("Received emoji_changed event", event);
  if (!channelEmoji) return;

  // Slack exposes both a name and names, and seems to use both in different contexts
  const names = Array.from(
    new Set([event.name, ...(event.names || [])]),
  ).filter(Boolean);

  // Aliases
  if (event.subtype === "add" && event.value?.startsWith("alias:")) {
    const alias = event.value.slice(6);
    await send(
      channelEmoji,
      names
        .map(
          (name) =>
            `:linked_paperclips: :${name}: \`:${name}:\` \`:${alias}:\``,
        )
        .join("\n"),
    );
    return;
  }

  // Removals
  if (event.subtype === "remove") {
    await send(
      channelEmoji,
      names.map((name) => `:heavy_minus_sign: \`:${name}:\``).join("\n"),
    );
    return;
  }

  // Additions
  await send(
    channelEmoji,
    names.map((name) => `:heavy_plus_sign: :${name}: \`:${name}:\``).join("\n"),
  );
});

const accessible = (channel: {
  is_channel?: boolean;
  is_archived?: boolean;
  is_private?: boolean;
}) => channel.is_channel && !channel.is_archived && !channel.is_private;

app.event("channel_created", async ({ event }) => {
  debug("Received channel_created event", event);
  if (!channelChannels) return;
  if (!accessible(event.channel)) return;

  await send(
    channelChannels,
    `:heavy_plus_sign: <#${event.channel.id}> \`#${event.channel.name}\``,
  );
});

app.event("channel_unarchive", async ({ event }) => {
  debug("Received channel_unarchive event", event);
  if (!channelChannels) return;

  const { channel } = await app.client.conversations.info({
    channel: event.channel,
  });
  if (!channel) {
    console.error("Channel not found", event.channel);
    return;
  }
  if (!accessible(channel)) return;

  await send(
    channelChannels,
    `:curly_loop: <#${channel.id}> \`#${channel.name}\``,
  );
});

(async () => {
  await app.start();
  console.log("Papertrail is running!");
})();
