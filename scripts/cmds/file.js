const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "file",
    aliases: [],
    version: "2.0",
    author: "Priyanshi Kaur||rifat",
    countDown: 5,
    role: 0,
    shortDescription: "Send file content",
    longDescription: "Send the plain text content of a .js file in this folder",
    category: "admin",
    guide: {
      en: "{pn} filename\nType `file filename` without prefix to trigger from chat"
    }
  },

  onStart: async function ({ message, args }) {
    const filename = args[0];
    if (!filename) return message.reply("❗Please provide a file name (without `.js`).");

    const filePath = path.join(__dirname, `${filename}.js`);
    if (!fs.existsSync(filePath)) return message.reply(`❌ File not found: ${filename}.js`);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      if (content.length > 4000) return message.reply("⚠️ File is too large to display.");
      return message.reply(`📄 File content of ${filename}.js:\n\n${content}`);
    } catch (err) {
      return message.reply("❌ Failed to read the file.");
    }
  },

  onChat: async function ({ event, message }) {
    const body = event.body?.trim().toLowerCase();
    if (!body || !body.startsWith("file ")) return;

    const filename = body.slice(5).trim();
    if (!filename) return;

    const filePath = path.join(__dirname, `${filename}.js`);
    if (!fs.existsSync(filePath)) return message.reply(`❌ File not found: ${filename}.js`);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      if (content.length > 4000) return message.reply("⚠️ File is too large to display.");
      return message.reply(`📄 File content of ${filename}.js:\n\n${content}`);
    } catch (err) {
      return message.reply("❌ Failed to read the file.");
    }
  }
};
