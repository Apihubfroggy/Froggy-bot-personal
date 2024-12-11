const axios = require("axios");

async function fetchKeys() {
  const response = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
  return response.data; 
}

async function fetchResponses() {
  const keys = await fetchKeys();
  const response = await axios.get("https://api.jsonbin.io/v3/b/671e8d78ad19ca34f8bf88e0?host=jan-SiamTheFrogxAminulSordar.heroku.com", {
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": keys.masterKey 
    }
  });
  return response.data.record; 
}

function findResponse(input, responses) {
  const normalizedInput = input.toLowerCase();
  for (const key in responses) {
    const normalizedKey = key.toLowerCase();
    
    if (normalizedInput.includes(normalizedKey)) {
      return responses[key];
    }
  }
  return null;
}

module.exports = {
  config: {
    name: "jan",
    version: "1.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
    shortDescription: "jan simsimi",
    longDescription: "",
    category: "jan",
    guide: "{pn} <message>"
  },

  onReply: async function ({ api, event, replyData }) {
    const replies = await fetchResponses();
    const reply = event.body; 
    const responseMessage = findResponse(reply, replies) || "আমাকে এটা শেখানো হয়নি জান। 👀"; 

    await api.sendMessage(responseMessage, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID
      });
    }, event.messageID);
  },

  onStart: async function ({ api, args, event }) {
    const replies = await fetchResponses();
    const input = args.join(" "); 
    const initialResponse = findResponse(input, replies) || "jan kichu bujhte parlam na"; 

    await api.sendMessage(initialResponse, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID
      });
    }, event.messageID);
  }
};
