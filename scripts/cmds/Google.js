const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    version: "1.0",
    author: "SiamTheFrog",
    shortDescription: "Search Google for information",
    longDescription: "Search Google and retrieve top search results by using /google <query>.",
    category: "tools",
    guide: "{pn} <search query>"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("Please provide a search query.", event.threadID, event.messageID);
    }

    try {
      const Mastermind = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
      const { masterKey, accessKey } = Mastermind.data;

      const ApiUrl = await axios.get("https://api.jsonbin.io/v3/b/6720852aad19ca34f8c059be?host=SiamTheFrog.heroku.com", {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });

      const { apiUrl, headers } = ApiUrl.data.record;

      const options = {
        method: 'GET',
        url: apiUrl,
        params: { q: query, lr: 'en-US', num: '10' },
        headers: headers
      };

      const response = await axios.request(options);
      const results = response.data.items.slice(0, 5).map((item, index) => 
        `${index + 1}. ${item.title}\n${item.link}`
      ).join("\n\n");

      api.sendMessage(`ðŸ” Google Search Results for "${query}":\n\n${results}`, event.threadID, event.messageID);
    } catch (error) {
      console.error("Error details:", error);
      api.sendMessage("âŒ Error: Unable to retrieve search results.Contact SiamTheFrog.", event.threadID, event.messageID);
    }
  }
};
