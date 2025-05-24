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

  if (threadQueue.has(url)) return;

  threadQueue.add(url);
  downloadQueue.set(event.threadID, threadQueue);

  try {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    await message.reply("⏳ Fetching and downloading video...");

    const filename = path.join(__dirname, `fbdl-${Date.now()}.mp4`);
    const writer = fs.createWriteStream(filename);

    const response = await axios({
      method: "GET",
      url: `https://fbdl.onrender.com/fbdl?url=${encodeURIComponent(url)}`,
      responseType: "stream",
    });

    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: `✅ Facebook video downloaded successfully.`,
          attachment: fs.createReadStream(filename),
        },
        event.threadID,
        () => {
          fs.unlink(filename, (err) => {
            if (err) console.error("Failed to delete file:", filename);
            else console.log("🗑️ Deleted:", filename);
          });
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
    version: "2.3",
    author: "rifat",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "Download Facebook videos using link",
    },
    longDescription: {
      en: "Download Facebook videos using a public API directly and auto delete file",
    },
    category: "media",
    guide: {
      en: "{pn} <facebook video url> or just send a Facebook video link",
    },
  },

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
