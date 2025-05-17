const fs = require("fs");
const https = require("https");
const path = require("path");

module.exports = {
  config: {
    name: "rifat",
    aliases: [],
    version: "1.2",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: "Show rifat's info and video",
    longDescription: "Shows info and sends a short video from imgur",
    category: "info",
    guide: {
      en: "{pn} or just type rifat"
    }
  },

  onStart: async function ({ message, event }) {
    const videoUrl = "https://i.imgur.com/8mxJ66I.mp4";
    const tempPath = path.join(__dirname, "rifat_video.mp4");

    const info = `┏✦━━━━━━━━━━━━✦┓

  ✦  𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 ✦

     『 𝐘𝐨𝐮𝐫 𝐁𝐨𝐲 』
     『 𝐌𝐝 𝐑𝐢𝐟𝐚𝐭 𝐇𝐨𝐬𝐬𝐚𝐢𝐧 』

     𝐀𝐠𝐞: 18
     𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧𝐬𝐡𝐢𝐩: 𝐒𝐢𝐧𝐠𝐥𝐞
     𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤:
     www.facebook.com/rifat.gmer.69

     𝐎𝐖𝐍𝐄𝐑 𝐑𝐢𝐟𝐚𝐭

┗✦━━━━━━━━━━━━✦┛`;

    const file = fs.createWriteStream(tempPath);

    https.get(videoUrl, response => {
      response.pipe(file);

      file.on("finish", async () => {
        file.close();

        await message.send({
          body: info,
          attachment: fs.createReadStream(tempPath)
        });

        fs.unlink(tempPath, err => {
          if (err) console.error("File delete error:", err);
        });
      });

    }).on("error", async err => {
      console.error("Download error:", err);
      await message.reply("ভিডিও পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।");
    });
  },

  onChat: async function ({ event, message }) {
    if (event.body?.toLowerCase() === "rifat") {
      this.onStart({ event, message });
    }
  }
};
