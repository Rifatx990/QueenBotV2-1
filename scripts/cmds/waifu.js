const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "waifu",
        aliases: ["animepic"],
        version: "1.0.0",
        author: "Fahim the Noob",
        role: 0,
        shortDescription: {
            en: "Get a random waifu picture"
        },
        longDescription: {
            en: "Fetches a random waifu picture and sends it in the chat."
        },
        category: "Entertainment",
        guide: {
            en: "Type {pn} to get a random waifu picture."
        }
    },
    onStart: async function ({ api, event }) {
        try {
            const response = await axios.get('https://fahim-waifu.onrender.com/waifu');
            const data = response.data;

            const imageUrl = data.picture;
            const imagePath = path.resolve(__dirname, 'waifu.jpg');
            
            // Download the image
            const writer = fs.createWriteStream(imagePath);
            const imageResponse = await axios({
                url: imageUrl,
                method: 'GET',
                responseType: 'stream'
            });

            imageResponse.data.pipe(writer);

            writer.on('finish', () => {
                // Send the image in the chat
                api.sendMessage({
                    body: `Here your waifu picture`,
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID, () => {
                    // Delete the image after sending
                    fs.unlinkSync(imagePath);
                });
            });

            writer.on('error', (err) => {
                console.error(err);
                api.sendMessage("Sorry, an error occurred while fetching the waifu image.", event.threadID);
            });
        } catch (error) {
            console.error(error);
            api.sendMessage("Sorry, an error occurred while fetching waifu data.", event.threadID);
        }
    },
    onReply: async function ({ api, event, reply }) {
        try {
            const response = await axios.get('https://fahim-waifu.onrender.com/waifu');
            const data = response.data;

            const imageUrl = data.picture;
            const imagePath = path.resolve(__dirname, 'waifu.jpg');
            
            // Download the image
            const writer = fs.createWriteStream(imagePath);
            const imageResponse = await axios({
                url: imageUrl,
                method: 'GET',
                responseType: 'stream'
            });

            imageResponse.data.pipe(writer);

            writer.on('finish', () => {
                // Send the image in the chat
                api.sendMessage({
                    body: `Here your waifu picture`,
                    attachment: fs.createReadStream(imagePath)
                }, reply.threadID, () => {
                    // Delete the image after sending
                    fs.unlinkSync(imagePath);
                });
            });

            writer.on('error', (err) => {
                console.error(err);
                api.sendMessage("Sorry, an error occurred while fetching the waifu image.", reply.threadID);
            });
        } catch (error) {
            console.error(error);
            api.sendMessage("Sorry, an error occurred while fetching waifu data.", reply.threadID);
        }
    }
};
