const fs = require("fs");
const path = __dirname + "/supportgc.json";

module.exports = {
  config: {
    name: "supportgc",
    aliases: ["support"],
    version: "1.1",
    author: "rifat",
    role: 0,
    shortDescription: {
      en: "Join or manage support groups"
    },
    longDescription: {
      en: "Use this command to join the support group or manage support groups if you're admin"
    },
    category: "utility",
    guide: {
      en: "{pn} => show/join support group\n{pn} add => add current group as support group\n{pn} remove => remove current group\n{pn} list => show support group list"
    }
  },

  onStart: async function ({ api, event, args, usersData, threadsData, role }) {
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));
    let data = JSON.parse(fs.readFileSync(path));
    const tid = event.threadID;

    const sendSupportList = async () => {
      if (data.length === 0) return api.sendMessage("No support group found.", tid);
      const list = await Promise.all(data.map(async id => {
        let name;
        try {
          name = await threadsData.get(id)?.threadName;
          if (!name) {
            const info = await api.getThreadInfo(id);
            name = info.threadName || "Unnamed Group";
          }
        } catch (e) {
          name = "Unknown";
        }
        return `• ${name} (${id})`;
      }));
      api.sendMessage("Support Group List:\n" + list.join("\n"), tid);
    };

    if (args[0] === "add" && role === 2) {
      if (!data.includes(tid)) {
        data.push(tid);
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        api.sendMessage("✅ This group has been added to the support group list.", tid);
      } else {
        api.sendMessage("⚠️ This group is already in the support group list.", tid);
      }
      return;
    }

    if (args[0] === "remove" && role === 2) {
      if (data.includes(tid)) {
        data = data.filter(id => id !== tid);
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        api.sendMessage("❌ This group has been removed from the support group list.", tid);
      } else {
        api.sendMessage("⚠️ This group is not in the support group list.", tid);
      }
      return;
    }

    if (args[0] === "list") {
      return sendSupportList();
    }

    // Normal user: show or add user to support group
    if (data.length === 0) return api.sendMessage("There are no support groups available right now.", tid);

    const supportTid = data[0]; // Use the first support group
    if (supportTid === tid) {
      return api.sendMessage("This is already a support group.", tid);
    }

    let groupName = "Unknown Group";
    try {
      groupName = await threadsData.get(supportTid)?.threadName;
      if (!groupName) {
        const info = await api.getThreadInfo(supportTid);
        groupName = info.threadName || "Unnamed Group";
      }
    } catch (e) {}

    try {
      await api.addUserToGroup(event.senderID, supportTid);
      return api.sendMessage(`✅ You've been added to the support group: ${groupName}`, tid);
    } catch (e) {
      return api.sendMessage(`Support Group:\n• Name: ${groupName}\n• ID: ${supportTid}\nAsk an admin to add you manually.`, tid);
    }
  }
};
