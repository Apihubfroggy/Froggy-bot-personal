const axios = require('axios');

module.exports = {
  config: {
    name: "rmusic",
    role: 0,
    aliases: ["r"],
    version: "1.0.0",
    author: "SiamTheFrog",
    countDown: 15,
    shortDescription: "Get random song with phonk",
    longDescription: "Fetch random song 2 category phonk and english+hindi random song",
    category: "music",
    guide: "{pn} phonk, {pn} rmusic ",
  },

  onStart: function () {
    console.log("rmusic command is ready to use!");
  },

  onChat: async function ({ api, event }) {
    const { threadID, messageID, body } = event;

    if (body.toLowerCase() === '/rmusic' || body.toLowerCase() === '/rmusic phonk') {
      const waitingMessage = await api.sendMessage("🎶 Please wait... fetching your song.", threadID, messageID);

      setTimeout(() => {
        api.unsendMessage(waitingMessage.messageID);
      }, 2000);

      try {
        const apiUrl = body.toLowerCase() === '/rmusic' 
          ? 'https://frog-api-rmusic.onrender.com/random' 
          : 'https://froggy-phonk-api.onrender.com/random';

        const response = await axios.get(apiUrl);

        if (response.data && response.data.song_url) {
          const songUrl = response.data.song_url;
          api.sendMessage({
            body: body.toLowerCase() === '/rmusic' 
              ? "🎶 Here is a random song for you:" 
              : "🎵 Here is a random phonk song for you:",
            attachment: await global.utils.getStreamFromURL(songUrl),
          }, threadID, messageID);
        } else {
          api.sendMessage("❌ No song found. Please try again later.", threadID, messageID);
        }
      } catch (error) {
        api.sendMessage("❌ Failed to fetch the song.contact SiamTheFrog🐸.", threadID, messageID);
      }
    }
  },
};
