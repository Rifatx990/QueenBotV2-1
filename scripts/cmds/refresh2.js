const fs = require("fs-extra");
const { exec } = require("child_process");
const configPath = `${__dirname}/tmp/refresh-config.json`;
const notifyPath = `${__dirname}/tmp/refresh-notify.json`;

let refreshLoop = null;
let uptimeStart = Date.now();

module.exports = {
  config: {
    name: "refresh2",
    version: "3.1",
    author: "rifat",
    countDown: 5,
    role: 2,
    description: {
      en: "Auto restart bot, clear memory, and notify groups"
    },
    category: "system",
    guide: {
      en: "{pn} on [time]\n{pn} off\n{pn} notify add/remove/list [tid]"
    }
  },

  onStart: async function ({ message, args, api, event }) {
    const sub = args[0];

    if (sub === "on") {
      if (refreshLoop) return message.reply("⚠️ | Refresh loop already active.");
      const interval = parseDuration(args.slice(1).join(" ")) || 6 * 60 * 60 * 1000;
      fs.writeJsonSync(configPath, { enabled: true, interval });
      message.reply(`✅ | Refresh ON. Restart every ${formatDuration(interval)}.`);
      startRefreshLoop(api, interval);
    }

    else if (sub === "off") {
      if (!fs.existsSync(configPath)) return message.reply("⚠️ | Refresh is not running.");
      fs.removeSync(configPath);
      clearInterval(refreshLoop);
      refreshLoop = null;
      message.reply("❌ | Refresh OFF.");
    }

    else if (sub === "notify") {
      const action = args[1];
      const tid = args[2] || event.threadID;
      const list = fs.existsSync(notifyPath) ? fs.readJsonSync(notifyPath) : [];

      if (action === "add") {
        if (!list.includes(tid)) list.push(tid);
        fs.writeJsonSync(notifyPath, list);
        message.reply(`✅ | Added TID ${tid} to notification list.`);
      } else if (action === "remove") {
        const index = list.indexOf(tid);
        if (index !== -1) list.splice(index, 1);
        fs.writeJsonSync(notifyPath, list);
        message.reply(`❌ | Removed TID ${tid} from notification list.`);
      } else if (action === "list") {
        if (list.length === 0) return message.reply("📭 | No TIDs in notification list.");
        message.reply("📋 | Notification Group TIDs:\n" + list.join("\n"));
      } else {
        message.reply("Usage:\n{pn} notify add/remove/list [tid]");
      }
    }

    else {
      message.reply("Use:\n→ refresh on [time]\n→ refresh off\n→ refresh notify add/remove/list [tid]");
    }
  },

  onLoad: ({ api }) => {
    if (fs.existsSync(configPath)) {
      const { enabled, interval } = fs.readJsonSync(configPath);
      if (enabled) startRefreshLoop(api, interval || 6 * 60 * 60 * 1000);
    }
  }
};

function startRefreshLoop(api, interval) {
  const restart = () => {
    const uptimeMins = Math.floor((Date.now() - uptimeStart) / 60000);
    const groups = fs.existsSync(notifyPath) ? fs.readJsonSync(notifyPath) : [];

    for (const tid of groups) {
      api.sendMessage(
        `🔁 Bot restarting...\n🕒 Uptime: ${uptimeMins} minutes\n🧹 Clearing memory...`,
        tid
      );
    }

    // Clear memory (may fail in restricted environments)
    exec("sync; echo 3 > /proc/sys/vm/drop_caches", (err) => {
      if (err) console.log("Memory clear error:", err.message);
    });

    // Optional: hook sleep.js
    try {
      const sleepCmd = require("./sleep");
      if (typeof sleepCmd.trigger === "function") sleepCmd.trigger(api);
    } catch (e) {}

    setTimeout(() => process.exit(2), 2000);
  };

  refreshLoop = setInterval(restart, interval);
  setTimeout(restart, interval);
}

function parseDuration(text) {
  const regex = /(\d+)\s*h(?:ours?)?|\s*(\d+)\s*m(?:inutes?)?/gi;
  let match, ms = 0;
  while ((match = regex.exec(text))) {
    if (match[1]) ms += parseInt(match[1]) * 60 * 60 * 1000;
    if (match[2]) ms += parseInt(match[2]) * 60 * 1000;
  }
  return ms || null;
}

function formatDuration(ms) {
  const h = Math.floor(ms / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${h > 0 ? h + "h " : ""}${m}m`;
}
