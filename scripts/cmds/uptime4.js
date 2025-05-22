

const os = require("os");
const { execSync } = require("child_process");
const { performance } = require("perf_hooks");

module.exports = {
  config: {
    name: "uptime4",
    aliases: ["upt4", "up4", "stats4", "info4"],
    version: "1.1",
    author: "rifat",
    role: 0,
    category: "system",
    shortDescription: { en: "Show system uptime in style" },
    longDescription: { en: "Stylish bot uptime with system info and loading animation." },
    guide: { en: "{pn}uptime4" }
  },

  onStart: async function ({ api, event }) {
    return runUptime(api, event);
  },

  onChat: async function ({ event, api }) {
    const msg = event.body?.toLowerCase() || "";
    const triggers = ["uptime4", "up4", "upt4", "stats4", "info4"];
    if (triggers.includes(msg)) return runUptime(api, event);
  }
};

async function runUptime(api, event) {
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const boxAnim = [
    "╭───────╮\n│ █░░░░ │\n╰───────╯",
    "╭───────╮\n│ ██░░░ │\n╰───────╯",
    "╭───────╮\n│ ███░░ │\n╰───────╯",
    "╭───────╮\n│ ████░ │\n╰───────╯",
    "╭───────╮\n│ █████ │\n╰───────╯"
  ];

  try {
    const loading = await api.sendMessage(`⏳ Loading system stats...\n${boxAnim[0]}`, event.threadID);

    for (let i = 1; i < boxAnim.length; i++) {
      await delay(300);
      await api.editMessage(`⏳ Loading system stats...\n${boxAnim[i]}`, loading.messageID, event.threadID);
    }

    const uptimeSec = process.uptime();
    const days = Math.floor(uptimeSec / 86400);
    const hours = Math.floor((uptimeSec % 86400) / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = Math.floor(uptimeSec % 60);
    const uptimeStr = `${pad(days)}D ${pad(hours)}H ${pad(minutes)}M ${pad(seconds)}S`;

    const now = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });
    let [date, time] = now.split(", ");
    if (!time) [date, time] = ["", now];

    const dependenciesCount = 50;
    const performanceMs = Math.floor(performance.now());

    const osType = os.type();
    const osRelease = os.release();
    const osArch = os.arch();

    const cpus = os.cpus();
    const cpuCount = cpus.length;
    const cpuModel = cpus[0]?.model || "Unknown CPU";

    const totalMem = os.totalmem() / 1024 / 1024 / 1024;
    const freeMem = os.freemem() / 1024 / 1024 / 1024;
    const usedMem = totalMem - freeMem;

    let diskUsed = "N/A", diskTotal = "N/A", diskFree = "N/A";
    try {
      const dfRaw = execSync("df -h /").toString().split("\n")[1].split(/\s+/);
      diskTotal = dfRaw[1] || diskTotal;
      diskUsed = dfRaw[2] || diskUsed;
      diskFree = dfRaw[3] || diskFree;
    } catch {}

    let primaryIP = "N/A";
    try {
      const ipRaw = execSync("hostname -I || hostname -i").toString().trim();
      primaryIP = ipRaw.split(/\s+/)[0] || primaryIP;
    } catch {}

    const requestedBy = event.senderName || event.senderID;
    const author = "Rifat";

    const message = `
╭━━━[ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢 ]━━━╮
┃ 🕐 Time          : ${time} | ${date}
┃ ⏱️ Uptime        : ${uptimeStr}
┃ 📦 Dependencies  : ${dependenciesCount}
┃ ⚙️ Performance   : ${performanceMs}ms
┃
┃ 🖥️ OS            : ${osType} ${osRelease} (${osArch})
┃ 🧠 CPU           : ${cpuCount} Core(s)
┃                ↳ ${cpuModel}
┃
┃ 📊 RAM Used      : ${usedMem.toFixed(2)} / ${totalMem.toFixed(2)} GB
┃ 🛢️ Free RAM      : ${freeMem.toFixed(2)} GB
┃ 💽 Disk Used     : ${diskUsed} / ${diskTotal}
┃ 📂 Free Storage  : ${diskFree}
┃ 🌐 IP Address    : ${primaryIP}
┃ 🙋 Requested by  : ${requestedBy}
┃ 🧑‍💻 Author       : ${author}
╰━━━━━━━━━━━━━━━━━━━━━━━╯`.trim();

    await delay(500);
    await api.editMessage(message, loading.messageID, event.threadID);

  } catch (err) {
    console.error("Uptime4 Error:", err);
    await api.sendMessage("❌ Failed to get system info.", event.threadID);
  }
}

function pad(num) {
  return num.toString().padStart(2, "0");
}
