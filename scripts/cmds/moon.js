const moment = require("moment-timezone");
const fs = require("fs-extra");
const axios = require("axios");
const Canvas = require("canvas");
const https = require("https");
const agent = new https.Agent({ rejectUnauthorized: false });
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "moon",
    version: "1.5",
    author: "NTKhang & fixed by ChatGPT",
    countDown: 5,
    role: 0,
    description: {
      vi: "Xem ảnh mặt trăng vào đêm bạn chọn (dd/mm/yyyy)",
      en: "View moon image on the night you choose (dd/mm/yyyy)"
    },
    category: "image",
    guide: {
      vi: "  {pn} <ngày/tháng/năm>\n   {pn} <ngày/tháng/năm> <caption>",
      en: "  {pn} <day/month/year>\n   {pn} <day/month/year> <caption>"
    }
  },

  langs: {
    vi: {
      invalidDateFormat: "Vui lòng nhập ngày/tháng/năm hợp lệ theo định dạng DD/MM/YYYY",
      error: "Không thể lấy ảnh mặt trăng của ngày %1, vui lòng thử ngày khác.",
      noData: "Không tìm thấy dữ liệu mặt trăng cho ngày %1",
      caption: "- Ảnh mặt trăng vào đêm %1"
    },
    en: {
      invalidDateFormat: "Please enter a valid date in DD/MM/YYYY format",
      error: "Could not retrieve the moon image for %1. Try a different date.",
      noData: "No moon data found for %1",
      caption: "- Moon image on %1"
    }
  },

  onStart: async function ({ args, message, getLang }) {
    if (!args[0]) return message.reply(getLang("invalidDateFormat"));

    const dateStr = args[0];
    const dateObj = parseDate(dateStr);
    if (!dateObj) return message.reply(getLang("invalidDateFormat"));

    const timestamp = Math.floor(dateObj.getTime() / 1000);

    let res;
    try {
      res = await axios.get(`https://api.farmsense.net/v1/moonphases/?d=${timestamp}`, { httpsAgent: agent });
    } catch (e) {
      return message.reply(getLang("error", dateStr));
    }

    if (!res.data || !res.data.length || res.data[0].Error === 1) {
      return message.reply(getLang("noData", dateStr));
    }

    const phaseData = res.data[0];
    // phaseData.Phase looks like "Waning Crescent", but sometimes uppercase with underscores

    // Find the moon image index by phase index (0-31)
    const phaseIndex = Number(phaseData.Index);
    const imgSrc = moonImages[phaseIndex] || moonImages[0];

    const captionText = `${getLang("caption", dateStr)}\n` +
      `- Phase: ${phaseData.Phase}\n` +
      `- Illumination: ${phaseData.Illumination || "N/A"}%\n` +
      `- Date: ${dateStr}`;

    if (args.length > 1) {
      try {
        const canvas = Canvas.createCanvas(1080, 2400);
        const ctx = canvas.getContext("2d");

        // Background black
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 1080, 2400);

        // Load moon image
        const imgBuffer = (await axios.get(imgSrc, { responseType: "arraybuffer" })).data;
        const moonImg = await Canvas.loadImage(imgBuffer);

        centerImage(ctx, moonImg, 1080 / 2, 1200, 970, 970);

        // Draw caption text
        ctx.font = "60px \"Kanit SemiBold\"";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        const userText = args.slice(1).join(" ");
        const wrappedText = getLines(ctx, userText, 594);
        let yText = 2095 - (wrappedText.length * 75) / 2;
        for (const line of wrappedText) {
          ctx.fillText(line, 540, yText);
          yText += 75;
        }

        // Save and send file
        const pathSave = __dirname + "/tmp/wallMoon.png";
        await fs.outputFile(pathSave, canvas.toBuffer());

        message.reply(
          { body: captionText, attachment: fs.createReadStream(pathSave) },
          () => fs.unlinkSync(pathSave)
        );
      } catch (e) {
        return message.reply(getLang("error", dateStr));
      }
    } else {
      try {
        const streamImg = await getStreamFromURL(imgSrc);
        message.reply(
          { body: captionText, attachment: streamImg }
        );
      } catch (e) {
        return message.reply(getLang("error", dateStr));
      }
    }
  }
};

// Helpers

function parseDate(str) {
  if (!str) return null;
  // Expecting DD/MM/YYYY
  const [d, m, y] = str.split("/");
  if (!d || !m || !y) return null;

  // Create a JS Date with the given date parts (in UTC to avoid timezone issues)
  const date = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00Z`);
  return isNaN(date.getTime()) ? null : date;
}

function getLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0] || "";
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function centerImage(ctx, img, x, y, sizeX, sizeY) {
  ctx.drawImage(img, x - sizeX / 2, y - sizeY / 2, sizeX, sizeY);
}

// Register font once
const pathFont = __dirname + "/assets/font/Kanit-SemiBoldItalic.ttf";
Canvas.registerFont(pathFont, { family: "Kanit SemiBold" });

const moonImages = [
  'https://i.ibb.co/9shyYH1/moon-0.png',
  'https://i.ibb.co/vBXLL37/moon-1.png',
  'https://i.ibb.co/0QCKK9D/moon-2.png',
  'https://i.ibb.co/Dp62X2j/moon-3.png',
  'https://i.ibb.co/xFKCtfd/moon-4.png',
  'https://i.ibb.co/m4L533L/moon-5.png',
  'https://i.ibb.co/VmshdMN/moon-6.png',
  'https://i.ibb.co/4N7R2B2/moon-7.png',
  'https://i.ibb.co/C2k4YB8/moon-8.png',
  'https://i.ibb.co/F62wHxP/moon-9.png',
  'https://i.ibb.co/Gv6R1mk/moon-10.png',
  'https://i.ibb.co/0ZYY7Kk/moon-11.png',
  'https://i.ibb.co/KqXC5F5/moon-12.png',
  'https://i.ibb.co/BGtLpRJ/moon-13.png',
  'https://i.ibb.co/jDn7pPx/moon-14.png',
  'https://i.ibb.co/kykn60t/moon-15.png',
  'https://i.ibb.co/qD4LFLs/moon-16.png',
  'https://i.ibb.co/qJm9gcQ/moon-17.png',
  'https://i.ibb.co/yYFYZx9/moon-18.png',
  'https://i.ibb.co/8bc7vpZ/moon-19.png',
  'https://i.ibb.co/jHG7DKs/moon-20.png',
  'https://i.ibb.co/5WD18Rn/moon-21.png',
  'https://i.ibb.co/3Y06yHM/moon-22.png',
  'https://i.ibb.co/4T8Zdfy/moon-23.png',
  'https://i.ibb.co/n1CJyP4/moon-24.png',
  'https://i.ibb.co/zFwJRqz/moon-25.png',
  'https://i.ibb.co/gVBmMCW/moon-26.png',
  'https://i.ibb.co/hRY89Hn/moon-27.png',
  'https://i.ibb.co/7C13s7Z/moon-28.png',
  'https://i.ibb.co/2hDTwB4/moon-29.png',
  'https://i.ibb.co/Rgj9vpj/moon-30.png',
  'https://i.ibb.co/s5z0w9R/moon-31.png'
];
