const axios = require('axios');
const PastebinAPI = require('pastebin-js');

module.exports = {
  config: {
    name: "past",
    version: "1.0.0.0",
    author: "SiamTheFrog",
    countDown: 5,
    role: 0,
    shortDescription: "Upload text to Pastebin",
    longDescription: "Uploads the replied message or provided text to Pastebin and returns the raw link.",
    category: "tools",
    guide: "{pn} [text] (or reply to a message)"
  },

  onStart: async function ({ api, event, args }) {
    const adminUID = "100004194914980";
    if (event.senderID !== adminUID) {
      return api.sendMessage("You do not have permission to use this command.", event.threadID, event.messageID);
    }

    let text;
    if (event.type === "message_reply" && event.messageReply.body) {
      text = event.messageReply.body;
    } else {
      text = args.join(" ");
    }

    if (!text) {
      return api.sendMessage("Please provide text or reply to a message to upload.", event.threadID, event.messageID);
    }

    try {
      const Mastermind = await axios.get('https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json');
      const { masterKey, accessKey } = Mastermind.data;

      if (!masterKey || !accessKey) {
        return api.sendMessage("Error contact SiamTheFrog", event.threadID, event.messageID);
      }

      const ApiUrl = await axios.get('https://api.jsonbin.io/v3/b/67372e1aacd3cb34a8a902b8?frog=pastebin.api.heroku.com', {
        headers: {
          'X-Master-Key': masterKey,
          'X-Access-Key': accessKey
        }
      });

      const pastebinConfig = ApiUrl.data.record.pastebin;
      const { apiurl, apikeys } = pastebinConfig;

      if (!apiurl || !apikeys || !apikeys.length) {
        return api.sendMessage("Error contact SiamTheFrog", event.threadID, event.messageID);
      }

      for (const apiKey of apikeys) {
        try {
          const pastebin = new PastebinAPI({ api_dev_key: apiKey });
          const paste = await pastebin.createPaste({
            text: text,
            title: "Uploaded via bot",
            privacy: 1
          });

          const rawPaste = paste.replace("pastebin.com", "pastebin.com/raw");
          return api.sendMessage(`Pastebin link: ${rawPaste}`, event.threadID, event.messageID);
        } catch (error) {
          console.error(`API key ${apiKey} failed: ${error.message}`);
        }
      }

      return api.sendMessage("Error contact SiamTheFrog", event.threadID, event.messageID);
    } catch (error) {
      console.error("Error accessing configuration or keys:", error.message);
      return api.sendMessage("Error contact SiamTheFrog", event.threadID, event.messageID);
    }
  }
};
