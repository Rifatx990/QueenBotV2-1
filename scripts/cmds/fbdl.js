const axios = require("axios");
const fs = require("fs");
const path = require("path");

const downloadQueue = new Map();
const userDownloadLimits = new Map();
const HOURLY_LIMIT = 25;

const facebookRegex = /(https?:\/\/(?:www\.)?(?:facebook|fb)\.(?:com|watch)\/[^\s]+)/i;

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = userDownloadLimits.get(userId) || { count: 0, timestamp: now };

  if (now - userLimit.timestamp > 3600000) {
    userDownloadLimits.set(userId, { count: 1, timestamp: now });
    return true;
  }

  if (userLimit.count >= HOURLY_LIMIT) return false;

  userLimit.count++;
  userDownloadLimits.set(userId, userLimit);
  return true;
}

async function downloadAndSend(api, event, message, url) {
  const threadQueue = downloadQueue.get(event.threadID) || new Set();

  if (threadQueue.has(url)) return; // already downloading this in this thread

  threadQueue.add(url);
  downloadQueue.set(event.threadID, threadQueue);

  try {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    await message.reply("⏳ Fetching video data...");

    const res = await axios.get(`https://www.x-noobs-apis.42web.io/fbdl?url=${encodeURIComponent(url)}`);
    const data = res.data;

    if (!data.sd) {
      threadQueue.delete(url);
      downloadQueue.set(event.threadID, threadQueue);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ Failed to get video URL.");
    }

    const filename = path.join(__dirname, `fbdl-${Date.now()}.mp4`);
    const writer = fs.createWriteStream(filename);

    await message.reply("⬇️ Downloading video...");

    const response = await axios({
      method: "GET",
      url: data.sd,
      responseType: "stream",
    });

    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: `✅ ${data.title || "Facebook Video"}`,
          attachment: fs.createReadStream(filename),
        },
        event.threadID,
        () => {
          fs.unlinkSync(filename);
          console.log(`🗑️ Deleted: ${filename}`);
          threadQueue.delete(url);
          downloadQueue.set(event.threadID, threadQueue);
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        }
      );
    });

    writer.on("error", (err) => {
      console.error(err);
      threadQueue.delete(url);
      downloadQueue.set(event.threadID, threadQueue);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("❌ Error writing the video file.");
    });
  } catch (err) {
    console.error(err);
    threadQueue.delete(url);
    downloadQueue.set(event.threadID, threadQueue);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    message.reply("❌ An error occurred while processing the video.");
  }
}

module.exports = {
  config: {
    name: "fbdl",
    aliases: [],
    version: "2.1",
    author: "rifat",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "Auto download Facebook videos by detecting links",
    },
    longDescription: {
      en: "Automatically detects Facebook video links in chat messages and downloads the videos",
    },
    category: "media",
    guide: {
      en: "{pn} <facebook video url> or just send a Facebook video link",
    },
  },

  // Manual command usage
  onStart: async function({ api, event, args, message }) {
    const url = args[0];
    if (!url || !facebookRegex.test(url)) {
      return message.reply("❌ Please provide a valid Facebook video link.");
    }
    if (!checkRateLimit(event.senderID)) {
      return message.reply(`⚠️ You've reached the hourly download limit (${HOURLY_LIMIT})`);
    }
    await downloadAndSend(api, event, message, url);
  },

  // Auto detect link in any message
  onChat: async function({ api, event, message }) {
    const text = event.body || "";
    const match = text.match(facebookRegex);
    if (!match) return;

    if (!checkRateLimit(event.senderID)) {
      return message.reply(`⚠️ You've reached the hourly download limit (${HOURLY_LIMIT})`);
    }

    await downloadAndSend(api, event, message, match[0]);
  },
};
