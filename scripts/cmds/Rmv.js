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
    guide: "{pn} rmusic, {pn} rmusic phonk, {pn} rmusic akatsuki",
  },

  onStart: function () {
    console.log("rmusic command is ready to use!");
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

        if (body.toLowerCase() === '/rmv') {
          apiUrl = 'https://random-music-api.onrender.com/random';
          messageBody = "🎶 Here is a random song for you:";
          mediaKey = "song_url";
        } else if (body.toLowerCase() === '/rmv phonk') {
          apiUrl = 'https://froggy-phonk-api.onrender.com/random';
          messageBody = "🎵 Here is a random phonk song for you:";
          mediaKey = "song_url";
        } else if (body.toLowerCase() === '/rmv akatsuki') {
          apiUrl = 'https://akatsuki-amv-shorts-api.onrender.com/random';
          messageBody = "🎥 Here is a random Akatsuki video for you:";
          mediaKey = "video_url"; 
        }

        const response = await axios.get(apiUrl);

        console.log("API Response: ", response.data); 

        if (response.data && response.data[mediaKey]) {
          const mediaUrl = response.data[mediaKey];
          api.sendMessage({
            body: messageBody,
            attachment: await global.utils.getStreamFromURL(mediaUrl), 
          }, threadID, messageID);
        } else {
          api.sendMessage("❌ No media found. Please try again later.", threadID, messageID);
        }
      } catch (error) {
        console.error("Error fetching media:", error);
        api.sendMessage("❌ Failed to fetch the media. Please contact SiamTheFrog🐸.", threadID, messageID);
      }
    }
  },
};
