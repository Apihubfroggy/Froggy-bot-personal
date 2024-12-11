const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "host",
    version: "1.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
    shortDescription: "Upload an image to ImageHosting",
    longDescription: "Upload an image to ImageHosting by replying to an image.",
    category: "tools",
    guide: "{pn} <reply an image> [optional: png] [optional: html]"
  },

  onStart: async function ({ message, event, args }) {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return message.reply("Please reply to an image to use this command.");
    }

    const attachments = event.messageReply.attachments;
    const imageUrl = attachments[0].url;

    let masterKey, accessKey;

    try {
      const mastermindResponse = await fetch("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
      if (!mastermindResponse.ok) {
        throw new Error("error contact SiamTheFrog.");
      }
      const keyData = await mastermindResponse.json();
      masterKey = keyData.masterKey;
      accessKey = keyData.accessKey;

      const configResponse = await fetch("https://api.jsonbin.io/v3/b/671d1a78ad19ca34f8bef0de?host=SiamxAminul.heroku.com", {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });
      if (!configResponse.ok) {
        throw new Error("Failed contact SiamTheFrog.");
      }
      const configData = await configResponse.json();
      const uploadUrl = `${configData.record.api}&key=${configData.record.apiKey}`;

      const data = new URLSearchParams();
      data.append('source', imageUrl);
      data.append('type', 'url');

      const apiResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: data
      });

      const result = await apiResponse.json();

      if (result && result.status_code === 200) {
        const fileType = args[0] && args[0].toLowerCase() === 'png' ? 'png' : 'jpg';
        const cleanImageUrl = result.image.display_url.replace(/\.\w+$/, `.${fileType}`);

        if (args.includes('html')) {
          return message.reply(`<img src="${cleanImageUrl}" alt="Uploaded Image" />`);
        } else {
          return message.reply(`${cleanImageUrl}`);
        }
      } else {
        return message.reply("Failed to upload the image to FreeImageHost. Please try again.");
      }
    } catch (error) {
      return message.reply("Error: " + error.message);
    }
  }
};
