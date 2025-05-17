const fs = require("fs");

module.exports = {
  config: {
    name: "sleep",
    version: "1.3",
    author: "rifat",
    countDown: 0,
    role: 2,
    shortDescription: "Send jokes & reply if Rifat is mentioned",
    longDescription: "Sends a joke every 1.5h and replies beautifully when someone mentions Md Rifat Hossain",
    category: "system",
    guide: {
      en: "{pn}",
      vi: "{pn}"
    }
  },

  onStart: async function ({ message, threads }) {
    message.reply("Sleep mode activated.\n- Jokes every 1.5h\n- Replies if someone mentions Md Rifat Hossain.");

    const jokes = [
      "Why don’t scientists trust atoms? Because they make up everything!",
      "Why did the computer visit the doctor? It had a virus!",
      "Why don’t skeletons fight each other? They don’t have the guts.",
      "Parallel lines have so much in common… it’s a shame they’ll never meet.",
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
      "I'm reading a book on anti-gravity. It's impossible to put down!",
      "I would tell you a joke about construction... but I'm still working on it.",
      "Why did the bicycle fall over? Because it was two-tired!",
      "Why can't your nose be 12 inches long? Because then it would be a foot.",
      "What do you call cheese that isn't yours? Nacho cheese.",
      "I'm on a seafood diet. I see food and I eat it.",
      "What did one wall say to the other wall? I’ll meet you at the corner.",
      "Why did the math book look sad? Because it had too many problems.",
      "Want to hear a roof joke? The first one’s on the house.",
      "Why don't programmers like nature? Too many bugs.",
      "Why do cows wear bells? Because their horns don’t work.",
      "I'm friends with all electricians — we have good current connections.",
      "Why do ducks have tail feathers? To cover their buttquacks.",
      "Time flies like an arrow. Fruit flies like a banana.",
      "Why did the cookie go to the hospital? Because it felt crummy."
    ];

    async function sendJoke() {
      const allThreads = await threads.getAll();
      const groupThreads = allThreads.filter(thread => thread.isGroup && thread.members.length > 2);

      if (groupThreads.length === 0) return;

      const randomThread = groupThreads[Math.floor(Math.random() * groupThreads.length)];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

      global.api.sendMessage(`Here's a joke to lighten the mood:\n\n${randomJoke}`, randomThread.threadID);
    }

    sendJoke();
    setInterval(sendJoke, 5400000); // Every 1.5 hours
  },

  onChat: async function ({ event, message }) {
    const mentionText = event.body?.toLowerCase() || "";

    if (mentionText.includes("md rifat hossain")) {
      const animatedReply = `
╭────────────────────────────╮
│ 😴 Rifat এখন ঘুমাচ্ছে...     │
│ 📵 দয়া করে বিরক্ত কোরো না! │
╰────────────────────────────╯`;
      message.reply(animatedReply);
    }
  }
};
