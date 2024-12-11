const axios = require("axios");

module.exports = {
  config: {
    name: "art",
    version: "1.0",
    author: "SiamTheFrog",
    shortDescription: "Search for art images",
    longDescription: "Search for art and get images  /art <query>.",
    category: "media",
    guide: "{pn} <search query>"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("Please provide a search query.", event.threadID, event.messageID);
    }

    try {
      const keysResponse = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
      const masterKey = keysResponse.data.masterKey;

      const { data } = await axios.get("https://api.jsonbin.io/v3/b/67208f4eacd3cb34a89ed66d?host=SiamTheFrog.heroku.com", {
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": masterKey
        }
      });

      const apiUrl = data.record.api.art.url;

      const response = await axios.get(`${apiUrl}?q=${encodeURIComponent(query)}&limit=10&fields=id,title,image_id,artist_display,date_display`);
      const artworks = response.data.data;

      if (!artworks.length) {
        return api.sendMessage("No artworks found for your query.", event.threadID, event.messageID);
      }

      const randomArtwork = artworks[Math.floor(Math.random() * artworks.length)];
      const imageUrl = `https://www.artic.edu/iiif/2/${randomArtwork.image_id}/full/843,/0/default.jpg`;
      const message = {
        body: `ðŸŽ¨ Title: ${randomArtwork.title}\nArtist: ${randomArtwork.artist_display}\nDate: ${randomArtwork.date_display}\n`,
        attachment: await global.utils.getStreamFromURL(imageUrl)
      };

      api.sendMessage(message, event.threadID);
    } catch (error) {
      console.error("Error details:", error);
      api.sendMessage("âŒ Error: Contact SiamTheFrog.", event.threadID, event.messageID);
    }
  }
};
