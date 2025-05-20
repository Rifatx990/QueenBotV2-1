const os = require("os");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "ram",
    aliases: [],
    version: "2.0",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show system status with chart" },
    longDescription: { en: "Displays full system status info with pie chart using canvas" },
    category: "system",
    guide: { en: "{pn}" },
    trigger: { prefix: false, regex: /^(ram)$/i }
  },

  onStart: async function ({ api, event }) {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usedPercent = (usedMem / totalMem) * 100;

    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;

    const load = os.loadavg().map(n => n.toFixed(2)).join(" | ");
    const uptimeSec = os.uptime();
    const uptimeStr = `${Math.floor(uptimeSec / 86400)} Days ${Math.floor((uptimeSec % 86400) / 3600)} Hours ${Math.floor((uptimeSec % 3600) / 60)} Minutes ${Math.floor(uptimeSec % 60)} Seconds`;

    const nodeVer = process.version;
    const platform = os.platform();

    const totalUsers = 823;
    const totalThreads = 25;

    let usedStorage = 1;
    let freeStorage = 1;
    try {
      const df = execSync("df -k --output=used,avail / | tail -n1").toString().trim().split(/\s+/);
      usedStorage = parseInt(df[0]) * 1024;
      freeStorage = parseInt(df[1]) * 1024;
    } catch (e) {}

    const canvas = createCanvas(900, 540);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.font = "20px sans-serif";
    const lines = [
      "Uptime & System Info",
      `Uptime: ${uptimeStr}`,
      `Memory Usage: ${(usedMem / 1048576).toFixed(2)} MB / ${(totalMem / 1073741824).toFixed(2)} GB (${usedPercent.toFixed(2)}%)`,
      `CPU: ${cpuModel}`,
      `CPU Cores: ${cpuCores}`,
      `Load: ${load}`,
      `Node.js Version: ${nodeVer}`,
      `OS: ${platform}`,
      "",
      `Total Users: ${totalUsers}`,
      `Total Threads: ${totalThreads}`
    ];
    lines.forEach((line, i) => ctx.fillText(line, 20, 40 + i * 30));

    const chartData = [
      { label: "Used Memory", color: "#f36c7a", value: usedMem },
      { label: "Free Memory", color: "#4aa4f2", value: freeMem },
      { label: "CPU Cores", color: "#ffcc00", value: cpuCores * 1024 * 1024 * 1024 },
      { label: "Used Storage", color: "#f7968e", value: usedStorage },
      { label: "Free Storage", color: "#8df0aa", value: freeStorage }
    ];

    const totalVal = chartData.reduce((sum, d) => sum + d.value, 0);
    let startAngle = 0;
    const centerX = 650, centerY = 280, radius = 180;

    chartData.forEach(data => {
      const sliceAngle = (data.value / totalVal) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = data.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    chartData.forEach((d, i) => {
      ctx.fillStyle = d.color;
      ctx.fillRect(centerX + 100, 50 + i * 30, 20, 20);
      ctx.fillStyle = "#000";
      ctx.font = "16px sans-serif";
      ctx.fillText(d.label, centerX + 130, 66 + i * 30);
    });

    // Footer text (NOOB BOTV2)
    ctx.fillStyle = "#000";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("NOOB BOTV2", 30, canvas.height - 30);

    const imgPath = path.join(__dirname, "sys_status.png");
    fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

    await api.sendMessage({
      body: "System Info Snapshot",
      attachment: fs.createReadStream(imgPath)
    }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
  }
};
