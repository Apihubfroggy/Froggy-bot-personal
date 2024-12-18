const axios = require('axios');

module.exports = {
  config: {
    name: "rmv",
    role: 0,
    version: "1.0.0",
    author: "SiamTheFrog",
    countDown: 0,
    shortDescription: "Get random audio songs, anime videos, or memes.",
    longDescription: "Fetch random songs, anime videos, or memes from four categories: random songs, phonk, Akatsuki videos, or memes.",
    category: "entertainment",
    guide: "Available categories: {pn} rmv, {pn} rmv phonk, {pn} rmv akatsuki, {pn} rmv memes",
  },

  onStart: function () {
    console.log("rmv command is ready to use!");
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body } = event;

    const validCommands = [
      '/rmv',
      '/rmv phonk',
      '/rmv akatsuki',
      '/rmv memes'
    ];

    if (validCommands.includes(body.toLowerCase())) {
      const waitingMessage = await api.sendMessage("🎶 Please wait... fetching your content.", threadID, messageID);

      setTimeout(() => {
        api.unsendMessage(waitingMessage.messageID);
      }, 2000);

      try {
        const apiConfig = {
          '/rmv': 'https://rmv-ap-music-frog.vercel.app/random',
          '/rmv phonk': 'https://rmv-phonk-api-siam.vercel.app/random',
          '/rmv akatsuki': 'https://akatsuki-amv-short-api-frog.vercel.app/SiamTheFrog',
          '/rmv memes': 'https://funny-memes-api-siam-the-frog.vercel.app/SiamTheFrog'
        };

        const messages = {
          '/rmv': "🎶 Here is a random song for you:",
          '/rmv phonk': "🎵 Here is a random phonk song for you:",
          '/rmv akatsuki': "🎥 Here is a random Akatsuki video for you:",
          '/rmv memes': "😂 Here is a random meme for you:"
        };

        const mediaKeys = {
          '/rmv': "song_url",
          '/rmv phonk': "song_url",
          '/rmv akatsuki': "akatsuki_url",
          '/rmv memes': "memes_url"
        };

        const command = body.toLowerCase();
        const apiUrl = apiConfig[command];
        const messageBody = messages[command];
        const mediaKey = mediaKeys[command];

        const response = await axios.get(apiUrl);
        console.log("API Response:", response.data);

        if (response.data && response.data[mediaKey]) {
          const mediaUrl = response.data[mediaKey];
          console.log("Fetched Media URL:", mediaUrl);
          api.sendMessage({
            body: messageBody,
            attachment: await global.utils.getStreamFromURL(mediaUrl),
          }, threadID, messageID);
        } else {
          console.log("Media Key Missing:", response.data);
          api.sendMessage("❌ Unable to fetch media. Please try again later.", threadID, messageID);
        }
      } catch (error) {
        console.error("Error fetching media:", error.message);
        api.sendMessage("❌ Failed to fetch the media. Please contact SiamTheFrog🐸.", threadID, messageID);
      }
    }
  },
};
