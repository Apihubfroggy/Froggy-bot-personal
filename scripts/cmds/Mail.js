const fetch = require("node-fetch");
const encodedAuthor = 'U2lhbVRoZUZyb2c=';
if (Buffer.from(encodedAuthor, 'base64').toString('utf-8') !== 'SiamTheFrog') {
    throw new Error("Don't change author randi.");
}

module.exports = {
  config: {
    name: "mail",
    version: "1.0.0",
    author: "SiamTheFrog",
    countDown: 0,
    role: 0,
		category: "tools",
    description: "Generates a random email address or fetches inbox for a given email. Use `/mail` to get a random email, or `/mail inbox <email>` to fetch inbox messages.",
    shortDescription: "Get a random email address or fetch inbox.",
  },

  onStart: async function ({ message, args }) {
    const authorName = module.exports.config.author;
    if (authorName !== 'SiamTheFrog') {
        message.reply("Don't change author randi!");
        return;
    }

    const ApiUrl = "https://api.jsonbin.io/v3/b/671d145aacd3cb34a89d66ea?host=SiamxAminul.heroku.com";
    let configData;
    let masterKey, accessKey;

    try {
      const Mastermind = await fetch("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
      if (!Mastermind.ok) {
        throw new Error("Error contact SiamTheFrog.");
      }
      const keyData = await Mastermind.json();
      masterKey = keyData.masterKey;
      accessKey = keyData.accessKey;

      const response = await fetch(ApiUrl, {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });
      if (!response.ok) {
        throw new Error("API fetch error contact SiamTheFrog.");
      }
      const jsonResponse = await response.json();
      configData = jsonResponse.record.emailApi;
    } catch (error) {
      return message.reply("Error contact SiamTheFrog.");
    }

    const { generateEmail, fetchInbox } = configData;

    if (args[0] === "inbox") {
      const emailAddress = args[1];
      if (!emailAddress) {
        return message.reply("Please provide an email address.");
      }

      const inboxUrl = `${fetchInbox}&login=${emailAddress.split('@')[0]}&domain=${emailAddress.split('@')[1]}`;
      try {
        const response = await fetch(inboxUrl);
        if (!response.ok) {
          throw new Error("Inbox fetch error contact SiamTheFrog.");
        }
        const inboxData = await response.json();
        if (inboxData.length === 0) {
          return message.reply("No messages in the inbox.");
        }
        const messageContent = inboxData.map(msg => `Subject: ${msg.subject}\nFrom: ${msg.from}`).join('\n\n');
        message.reply(`
┌───────────────────────
│ 📧 Inbox for: ${emailAddress}
├───────────────────────
${messageContent}
└───────────────────────
        `);
      } catch (error) {
        message.reply("Error contact SiamTheFrog.");
      }
    } else {
      try {
        const response = await fetch(generateEmail);
        if (!response.ok) {
          throw new Error("Email generation error contact SiamTheFrog.");
        }
        const emailData = await response.json();
        const emailAddress = emailData[0];
        message.reply(`
┌───────────────────────
│ ✉️ Your Email: ${emailAddress}
└───────────────────────
        `);
      } catch (error) {
        message.reply("Error contact SiamTheFrog.");
      }
    }
  },
};
