const fs = require("fs-extra");
const { exec } = require("child_process");

let isEnabled = false;

module.exports = {
  config: {
    name: "refresh2",
    version: "1.3",
    author: "rifat",
    countDown: 5,
    role: 2,
    description: {
      en: "Clear memory (if allowed) and auto-restart after 6h — toggleable"
    },
    category: "system",
    guide: {
      en: "{pn} on | off"
    }
  },

  langs: {
    en: {
      on: "✅ | Refresh mode is now ON. Bot will restart in 6 hours.",
      off: "❌ | Refresh mode is now OFF.",
      alreadyOn: "⚠️ | Refresh mode is already ON.",
      alreadyOff: "⚠️ | Refresh mode is already OFF.",
      clearing: "🧹 | Attempting to clear system memory...",
      cleared: "✅ | Memory cleared or skipped due to permissions. Restart scheduled.",
      restarting: "🔁 | 6 hours passed. Restarting bot now..."
    }
  },

  onStart: async function ({ message, event, args, getLang }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;

    if (args[0] === "on") {
      if (isEnabled) return message.reply(getLang("alreadyOn"));
      isEnabled = true;
      fs.ensureDirSync(`${__dirname}/tmp`);
      fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
      message.reply(getLang("on"));

      message.reply(getLang("clearing"));
      exec("sync; echo 3 > /proc/sys/vm/drop_caches", (err) => {
        if (err) console.warn("Memory clear error (skipped):", err.message);
        message.reply(getLang("cleared"));
        setTimeout(() => {
          message.reply(getLang("restarting"));
          process.exit(2);
        }, 21600000); // 6 hours
      });
    }

    else if (args[0] === "off") {
      if (!isEnabled) return message.reply(getLang("alreadyOff"));
      isEnabled = false;
      if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile);
      message.reply(getLang("off"));
    }

    else {
      message.reply("Use:\n→ refresh on\n→ refresh off");
    }
  }
};
