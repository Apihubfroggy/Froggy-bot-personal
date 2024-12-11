const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "urlshortner",
    aliases: ["short"],
    version: "1.0.0",
    author: "SiamTheFrog>🐸",
    countDown: 0,
    role: 0,
		category: "tools",
    description: "Shorten URLs quickly using urlshortner.",
    shortDescription: "Quick URL shortener.",
  },

  onStart: async function ({ message, args }) {
    const apiUrl = "https://api.jsonbin.io/v3/b/671dbd61ad19ca34f8bf2620?host=SiamTheFrog.heroku.com";
    const urlToShorten = args[0];

    if (!urlToShorten) {
      return message.reply("Please provide a URL to shorten. Usage: /short <url>");
    }

    const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;
    if (!urlPattern.test(urlToShorten)) {
      return message.reply("Invalid URL provided. Please contact TeamTitans-SiamTheFrog.");
    }

    const mastermind = "https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json";

    try {
      const authResponse = await fetch(mastermind);
      if (!authResponse.ok) throw new Error("Unable to fetch authentication data. Contact TeamTitans-SiamTheFrog.");
      const authData = await authResponse.json();
      const masterKey = authData.masterKey;
      const accessKey = authData.accessKey;

      const configResponse = await fetch(apiUrl, {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });
      if (!configResponse.ok) throw new Error("API fetch error. Contact TeamTitans-SiamTheFrog.");
      const configData = await configResponse.json();
      const { apiKey, apiUrl: cuttlyUrl } = configData.record.cuttly;

      const cuttlyResponse = await fetch(`${cuttlyUrl}&short=${encodeURIComponent(urlToShorten)}&key=${apiKey}`);
      const data = await cuttlyResponse.json();

      if (data.url && data.url.shortLink) {
        const replyMessage = `
━━━━━━━━━━━━━━━━━━━━━━━
🌐 Original URL: ${urlToShorten}
🔗 Shortened URL: ${data.url.shortLink}
━━━━━━━━━━━━━━━━━━━━━━━
        `;
        return message.reply(replyMessage);
      } else {
        return message.reply("Error shortening the URL: " + data.message);
      }
    } catch (error) {
      return message.reply("Error while fetching data: " + error.message);
    }
  },
};
