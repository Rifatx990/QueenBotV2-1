const os = require("os");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { execSync } = require("child_process");

module.exports = {
  config: {
    name: "uptime3",
    aliases: ["up", "upt", "stats", "info"],
    author: "rifat",
    countDown: 0,
    role: 0,
    category: "system",
    description: "Displays system uptime as an image.",
    guide: {
      en: "Use {pn}uptime or type 'uptime' to get system uptime as a photo."
    }
  },

  onStart: async function ({ api, event }) {
    return sendUptimeImage(api, event);
  },

  onChat: async function ({ event, api }) {
    const lower = event.body?.toLowerCase() || "";
    const triggerWords = ["uptime", "up", "upt", "stats", "info"];
    if (triggerWords.includes(lower)) {
      return sendUptimeImage(api, event);
    }
  }
};

async function sendUptimeImage(api, event) {
  try {
    const uptimeSec = process.uptime();
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = Math.floor(uptimeSec % 60);
    const formattedUptime = `${days}D ${hours}H ${minutes}M ${seconds}S`;

    // Canvas setup
    const width = 1000;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    const bgImage = await loadImage("https://i.imgur.com/FNILVud.jpeg");
    ctx.drawImage(bgImage, 0, 0, width, height);

    // Text
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.fillText("SYSTEM UPTIME", width / 2, 420);
    ctx.fillRect(width / 2 - 180, 430, 360, 2); // underline
    ctx.fillText(`BOT UPTIME: ${formattedUptime}`, width / 2, 475);

    const imagePath = __dirname + "/uptime_output.jpg";
    const out = fs.createWriteStream(imagePath);
    const stream = canvas.createJPEGStream();
    stream.pipe(out);

    out.on("finish", () => {
      api.sendMessage({
        attachment: fs.createReadStream(imagePath)
      }, event.threadID, () => fs.unlinkSync(imagePath));
    });

  } catch (err) {
    console.error(err);
    api.sendMessage("⚠️ Failed to generate uptime image: " + err.message, event.threadID);
  }
}
