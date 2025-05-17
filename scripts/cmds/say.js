const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "say",
    aliases: ["tts"],
    version: "1.0",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: "Text to speech (auto language detection)",
    longDescription: "Convert text to speech with auto language detection",
    category: "fun",
    guide: {
      en: "{pn} <text>",
      vi: "{pn} <văn bản>"
    }
  },

  onStart: async function ({ message, args }) {
    const text = args.join(" ");
    if (!text) return message.reply("Please enter something to speak.");

    // Function to detect language based on text content
    const detectLanguage = (text) => {
      // Bangla: Checking if Bengali characters are present
      if (/[\u0980-\u09FF]/.test(text)) return "bn"; // Bengali characters range

      // Hindi: Checking if Hindi characters are present
      if (/[\u0900-\u097F]/.test(text)) return "hi"; // Hindi characters range

      // English: Checking if English characters are present
      if (/^[A-Za-z0-9\s]+$/.test(text)) return "en"; // English alphabet and numbers

      // Default to English if no other languages match
      return "en";
    };

    // Detect language from the text
    const langCode = detectLanguage(text);
    console.log(`Detected language: ${langCode}`);

    try {
      // Construct the URL for Google's TTS service
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=${langCode}&q=${encodeURIComponent(text)}`;

      // Make an HTTP request to get the speech audio
      const response = await axios.get(url, { responseType: 'stream' });

      // Save the response stream to an MP3 file
      const filePath = path.join(__dirname, "say-voice.mp3");
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        // Send the generated MP3 as an attachment
        message.send({ attachment: fs.createReadStream(filePath) }, () => {
          fs.unlinkSync(filePath); // Delete the file after sending
        });
      });
    } catch (err) {
      console.error("An error occurred during text-to-speech processing:", err);
      message.reply("❌ An error occurred while processing the text-to-speech. Please try again.");
    }
  }
};
