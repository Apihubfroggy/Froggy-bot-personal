const axios = require("axios");
const fetch = require("node-fetch");

module.exports.config = {
  name: "webss",
  aliases: ["ws"],
  version: "1.4",
  author: "SiamTheFrog",
  role: 0,
  description: "Take a screenshot of a website from a URL or a replied message",
  category: "media",
  guide: {
    en: "/webss <weburl>, /webss full <weburl>, /webss tablet <weburl>, /webss phone <weburl>, or reply to a message containing a URL with /webss",
  },
  coolDowns: 5,
};

exports.onStart = async function ({ api, event, args }) {
  let type = "full"; 
  let url;

  if (event.messageReply && event.messageReply.body) {
    const replyContent = event.messageReply.body.trim();
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const matchedUrls = replyContent.match(urlRegex);

    if (matchedUrls && matchedUrls.length > 0) {
      url = matchedUrls[0].startsWith("www")
        ? `http://${matchedUrls[0]}`
        : matchedUrls[0];
    }
  }

  if (!url && args.length === 1) {
    url = args[0].startsWith("www") ? `http://${args[0]}` : args[0];
  } else if (!url && args.length > 1) {
    type = args[0].toLowerCase();
    url = args.slice(1).join(" ");
    url = url.startsWith("www") ? `http://${url}` : url;
  }

  const dimensions = {
    full: "1920x1080",
    tablet: "1024x768",
    phone: "480x800",
  };

  const dimension = dimensions[type];
  if (!dimension) {
    return api.sendMessage(
      "❌ Invalid type! Please use one of the following:\n- full\n- tablet\n- phone\nOr reply to a message containing a URL.",
      event.threadID,
      event.messageID
    );
  }

  if (!url) {
    return api.sendMessage(
      "❌ No URL provided! Please provide a URL, reply to a message with a URL, or use:\n/webss <weburl>",
      event.threadID,
      event.messageID
    );
  }

  try {
    const MasterMind = await fetch("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json?MasterMind-Api-SiamTheFrog");
    if (!MasterMind.ok) {
      throw new Error("Error contact SiamTheFrog.");
    }
    const keyData = await MasterMind.json();
    const masterKey = keyData.masterKey;
    const accessKey = keyData.accessKey;

    const ApiUrl = await fetch("https://api.jsonbin.io/v3/b/67435e19ad19ca34f8cf91e4?Api-screenshot-Api-Frog.herokuapp.com", {
      headers: {
        "X-Master-Key": masterKey,
        "X-Access-Key": accessKey,
      },
    });

    if (!ApiUrl.ok) {
      throw new Error("Errror contact SiamTheFrog");
    }

    const Frog = await ApiUrl.json();
    const apiUrl = Frog.record.api;  
    const SiamTheFrog = Frog.record.SiamTheFrog;  

    const screenshotUrl = `${apiUrl}?key=${SiamTheFrog}&url=${encodeURIComponent(url)}&dimension=${dimension}`;

    const screenshotStream = await global.utils.getStreamFromURL(screenshotUrl);

    return api.sendMessage(
      {
        body: `✅ Screenshot captured for ${type.toUpperCase()}!`,
        attachment: screenshotStream,
      },
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error("Error:", error);
    return api.sendMessage(
      "❌ Failed to capture the screenshot. Please check the URL or try again later.",
      event.threadID,
      event.messageID
    );
  }
};
