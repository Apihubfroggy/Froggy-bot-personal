const axios = require('axios');

module.exports = {
  config: {
    name: "rmv",
    role: 0,
    version: "1.0.0",
    author: "SiamTheFrog",
    countDown: 0,
    shortDescription: "Get random audio song and Anime video.",
    longDescription: "Fetch random songs+Anime video from three categories: phonk and English/Hindi random songs, or random akatsuki videos.",
    category: "music",
    guide: "Available category: 1.rmv 2.phonk 3.akatsuki {pn} rmv, {pn} rmv phonk, {pn} rmv akatsuki",
  },

  onStart: function () {
    console.log("rmv command is ready to use!");
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body } = event;

    if (
      body.toLowerCase() === '/rmv' || 
      body.toLowerCase() === '/rmv phonk' || 
      body.toLowerCase() === '/rmv akatsuki'
    ) {
      const waitingMessage = await api.sendMessage("🎶 Please wait... fetching your song or video.", threadID, messageID);

      setTimeout(() => {
        api.unsendMessage(waitingMessage.messageID);
      }, 2000);

      try {
        let apiUrl;
        let messageBody;
        let mediaKey;

        const apiConfig = {
          '/rmv': 'https://rmv-ap-music-frog.vercel.app/random',
          '/rmv phonk': 'https://rmv-phonk-api-siam.vercel.app/random',
          '/rmv akatsuki': 'https://akatsuki-amv-short-api-frog.vercel.app/random'
        };

        const messages = {
          '/rmv': "🎶 Here is a random song for you:",
          '/rmv phonk': "🎵 Here is a random phonk song for you:",
          '/rmv akatsuki': "🎥 Here is a random Akatsuki video for you:"
        };

        const mediaKeys = {
          '/rmv': "song_url",
          '/rmv phonk': "song_url",
          '/rmv akatsuki': "song_url"
        };

        apiUrl = apiConfig[body.toLowerCase()];
        messageBody = messages[body.toLowerCase()];
        mediaKey = mediaKeys[body.toLowerCase()];

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
