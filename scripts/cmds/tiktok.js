const axios = require("axios");

module.exports = {
  config: {
    name: "tiksearch",
    aliases: ["tiktoksearch", "ts"],
    version: "1.1",
    author: "rifat",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Tìm video TikTok và tải về",
      en: "Search TikTok video and download"
    },
    longDescription: {
      vi: "Tìm kiếm TikTok và tải video đầu tiên",
      en: "Search TikTok and download the first result"
    },
    category: "media",
    guide: {
      vi: "{pn} <từ khóa>",
      en: "{pn} <keyword>"
    }
  },

  onStart: async function ({ message, args }) {
    const query = args.join(" ");
    if (!query) return message.reply("Vui lòng nhập từ khóa tìm kiếm\nPlease enter a search keyword.");

    const api = `https://www.x-noobs-apis.42web.io/tiksearch?search=${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(api);
      const videos = res.data.data.videos;
      if (!videos || videos.length === 0)
        return message.reply("Không tìm thấy video nào.\nNo videos found.");

      const video = videos[0]; // Get first result
      const stream = await global.utils.getStreamFromURL(video.play);

      return message.reply({
        body: `▶️ ${video.title}\n👤 ${video.author.nickname} | ❤️ ${video.digg_count}`,
        attachment: stream
      });
    } catch (err) {
      console.error(err);
      return message.reply("Đã xảy ra lỗi khi tải video.\nAn error occurred while downloading the video.");
    }
  }
};
