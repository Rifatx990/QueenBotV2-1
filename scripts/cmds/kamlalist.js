const fs = require("fs");
const filePath = __dirname + "/../kamlalist.json";

module.exports = {
  config: {
    name: "kamlalist",
    version: "1.0",
    author: "rifat",
    role: 1,
    shortDescription: "Manage kamla users list",
    longDescription: "Add or remove users from kamlalist by mention or UID",
    category: "fun",
    guide: {
      en: "{p}kamlalist [uid/@mention]\n{p}kamlalist remove [uid/@mention]"
    }
  },

  onStart: async function ({ api, event, args }) {
    // Create file if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }

    const kamlas = JSON.parse(fs.readFileSync(filePath));
    const mentions = Object.keys(event.mentions);
    const input = args[0]?.toLowerCase();

    // Remove user
    if (input === "remove" || input === "rm") {
      const target = mentions[0] || args[1];
      if (!target) return api.sendMessage("⚠️ | একজন UID দিন বা কাউকে মেনশন করুন মুছতে।", event.threadID, event.messageID);

      const index = kamlas.indexOf(target);
      if (index === -1) return api.sendMessage("❌ | এই UID তালিকায় নেই।", event.threadID, event.messageID);

      kamlas.splice(index, 1);
      fs.writeFileSync(filePath, JSON.stringify(kamlas));
      return api.sendMessage(`✅ | UID ${target} কে তালিকা থেকে সরানো হয়েছে।`, event.threadID, event.messageID);
    }

    // Add user
    const target = mentions[0] || args[0];
    if (!target) return api.sendMessage("⚠️ | একজন UID দিন বা কাউকে মেনশন করুন যোগ করতে।", event.threadID, event.messageID);

    if (kamlas.includes(target)) return api.sendMessage("ℹ️ | UID ইতিমধ্যে তালিকায় আছে।", event.threadID, event.messageID);

    kamlas.push(target);
    fs.writeFileSync(filePath, JSON.stringify(kamlas));
    return api.sendMessage(`✅ | UID ${target} কে কামলা তালিকায় যোগ করা হয়েছে।`, event.threadID, event.messageID);
  }
};
