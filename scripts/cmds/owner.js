const os = require("os");

module.exports = {
  config: {
    name: "owner",
    aliases: [],
    version: "1.0",
    author: "RIFAT",
    countDown: 5,
    role: 0,
    description: "Show information about the bot owner",
    category: "info",
    guide: {
      en: "{pn} - Show bot owner information"
    }
  },

  onStart: async function ({ message }) {
    const msg = getOwnerInfo();
    return message.reply(msg);
  },

  onChat: async function ({ event, message }) {
    const lower = event.body?.toLowerCase() || "";
    if (lower === "owner") {
      const msg = getOwnerInfo();
      return message.reply(msg);
    }
  }
};

function getOwnerInfo() {
  const uptime = process.uptime(); // in seconds

  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / 3600) % 24);
  const days = Math.floor(uptime / 86400);
  const duration = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  const botName = "NOOB BOTV2";
  const prefix = global.GoatBot?.config?.prefix || "!";

  return `👑 Owner Information 👑

• Name: Kazuha Yushimo
• Gender: Male
• Pronouns: He/Him
• Relationship: Single
• Facebook: https://www.facebook.com/100020516392760

🤖 Bot Info:
• Bot Name: ${botName}
• Prefix: ${prefix}
• Uptime: ${duration}
`;
}
