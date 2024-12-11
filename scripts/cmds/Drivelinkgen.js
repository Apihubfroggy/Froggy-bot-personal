const axios = require("axios");

const MasterMindUrl = "https://teamtitans3315.github.io/TeamTitans-github.io/MasterMind.json";
const apiUrl = "https://api.jsonbin.io/v3/b/6731e250e41b4d34e45236b8?host=DriveLinkGen-Api.frog.heroku.com";

module.exports = {
  config: {
    name: "drivelinkgen",
    version: "1.0",
    author: "SiamTheFrog",
    shortDescription: "Convert Google Drive link to direct download link",
    longDescription: "cnv Google Drive shared links to direct download link.",
		category: "tools",
    guide: "{pn} <google_drive_link> - Converts Google Drive link to direct link format.\n{pn} help - Instructions for setting up link access.",
    aliases: ["drive", "d"]
  },

  onStart: async function ({ args, message }) {
    if (args.length === 0) {
      return message.reply("Please provide a Google Drive link or type 'help' for instructions.");
    }

    if (args[0].toLowerCase() === "help") {
      return message.reply(
        "To generate a direct download link:\n" +
        "1. Go to your Google Drive and locate the file.\n" +
        "2. Right-click on the file, select 'Get link' and change the access to 'Anyone with the link'.\n" +
        "3. Copy the link and use the command like this:\n" +
        "`/directlinkgen <Google_Drive_Link>`\n" +
        "Example: /drivelinkgen https://drive.google.com/file/d/your-file-id/view"
      );
    }

    try {
    
      const masterConfigResponse = await axios.get(MasterMindUrl);
      const { masterKey, accessKey } = masterConfigResponse.data;

      const patternResponse = await axios.get(apiUrl, {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });

      const { idPattern, directLinkTemplate } = patternResponse.data.record;
      const link = args[0];
      const match = link.match(new RegExp(idPattern));

      if (!match) return message.reply("Invalid Google Drive link format.");

      const fileId = match[1];
      const directLink = `${directLinkTemplate}${fileId}`;

      message.reply(`Here is your direct download link:\n${directLink}`);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.reply("âŒ There was an error processing the link. Please try again later.");
    }
  }
};
