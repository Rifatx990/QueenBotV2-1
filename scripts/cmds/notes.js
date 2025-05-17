const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "notes",
    aliases: [],
    version: "2.0",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: "Send romantic messages to all group chats",
    longDescription: "Sends a formatted note to every group chat one by one with a time stamp",
    category: "admin",
    guide: "{p}notes"
  },

  onStart: async function ({ api, threadsData }) {
    const allThreads = await threadsData.getAll();
    const groupThreads = allThreads.filter(thread => thread.threadID && thread.threadID.length > 10);

    const romanticSentences = [
      "বয়স বাড়বে, হারানোর তালিকা দীর্ঘ হবে, যাদের সাথে থাকার কথা ছিলো তারাও হারিয়ে যাবে..!!",
      "তোমাকে হারিয়ে যেন নিজেকেই হারিয়ে ফেলেছি…!",
      "ভালোবাসা মানে না বলা হাজার কথা।",
      "তুমি না থাকলে আমি কিচ্ছু না…!",
      "ভালোবাসি বললে ভালোবাসা হয় না, তা প্রমাণ করতে হয়!",
      "তোমার চোখে তাকালেই হারিয়ে যাই!",
      "প্রেম মানে শুধু কাছে থাকা নয়, মনেরও মিল থাকতে হয়।",
      "তোমার হাসি আমার জীবনের সবচেয়ে বড় প্রাপ্তি।",
      "প্রতিটি সকাল শুরু হোক তোমার মিষ্টি মুখ দেখে।",
      "তুমি ছাড়া আমি অপূর্ণ।",
      "ভালোবাসা কখনো পুরোনো হয় না।",
      "যে ভালোবাসে, সে কখনো ভুলে না।",
      "তোমার স্পর্শেই আমার পৃথিবী বদলে যায়।",
      "তুমি আমার জীবনের সবচেয়ে বড় উপহার।",
      "তোমার জন্যই আমার বাঁচার ইচ্ছা জেগে ওঠে।",
      "তোমার একটুখানি ভালোবাসাই আমার জন্য যথেষ্ট।",
      "তুমি আমার সকাল, তুমি আমার রাত।",
      "তোমার ভালোবাসা আমার জীবনের আলো।",
      "ভালোবাসা কখনো শর্তসাপেক্ষ হয় না।",
      "তোমাকে ছাড়া কিছুই ভালো লাগে না।",
      "তোমার মিষ্টি কথায় আমি প্রতিদিন প্রেমে পড়ি।",
      "ভালোবাসা হলো একে অপরের মাঝে হারিয়ে যাওয়া।",
      "তোমার প্রতি ভালোবাসা কোনোদিন কমবে না।",
      "তোমার জন্য আমার ভালোবাসা চিরন্তন।",
      "ভালোবাসা মানে একে অপরের মাঝে বেঁচে থাকা।",
      "তোমার স্পর্শ আমার জীবনের আশীর্বাদ।",
      "তুমি আমার সুখের কারণ।",
      "তুমি ছাড়া আমার দিন শুরুই হয় না।",
      "তোমার চোখেই আমার পৃথিবী।",
      "তুমি না থাকলে আমার কিছুই ভালো লাগে না।",
      "তুমি ছাড়া কিছুই কল্পনা করা যায় না।",
      "তোমার ভালোবাসা আমার একমাত্র ভরসা।",
      "তোমার স্মৃতিতেই বাঁচি আমি।",
      "তুমি আমার হৃদয়ের একমাত্র মালিক।",
      "তোমার একটি হাসিই আমার মন ভালো করে দেয়।",
      "তোমাকে ছাড়া এক মুহূর্তও কল্পনা করতে পারি না।",
      "তুমি আমার প্রিয়তম।",
      "তোমার ভালোবাসায় নিজেকে ভাগ্যবান মনে করি।",
      "তুমি পাশে থাকলেই আমি শক্তি পাই।",
      "তোমার ভালোবাসা আমাকে জীবনে এগিয়ে যেতে সাহায্য করে।",
      // Add more sentences up to 100 as needed
    ];

    const timeDhaka = moment().tz("Asia/Dhaka").format("hh:mm A");
    const botName = "NOOB BOTV2";

    const message = (sentence) => `•—»🩷 𝐓𝐈𝐌𝐄 ${timeDhaka} 🩷«—•\n\n✢━━━━━━━━━━━━━━━✢\n\n-••🌻🦋🤍${sentence}🦋🌼\n\n✢━━━━━━━━━━━━━━━✢\n⃝—͟͟͞͞ ${botName}𓆪___//🩷🪽`;

    for (const thread of groupThreads) {
      const randomSentence = romanticSentences[Math.floor(Math.random() * romanticSentences.length)];
      try {
        await api.sendMessage(message(randomSentence), thread.threadID);
        await new Promise(resolve => setTimeout(resolve, 4000)); // Wait between messages
      } catch (err) {
        console.log(`Failed to send message to ${thread.threadID}:`, err.message);
      }
    }
  }
};
