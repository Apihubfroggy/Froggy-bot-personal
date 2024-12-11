const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "titanstore",
    version: "1.0.0",
    author: "Siam the frog>🐸",
    countDown: 0,
    role: 2,
    category: "tools",
    description: "Displays the command list with ID, name, code link, and description.",
    shortDescription: "List commands with detailed info.",
  },

  onStart: async function ({ api, event, message, args }) {
    let commands = [];
    let keys = {};

    try {
      
      const keysResponse = await fetch("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
      keys = await keysResponse.json();

      const response = await fetch("https://api.jsonbin.io/v3/b/671d0734e41b4d34e4492a88?host=SiamTheFrogxAminulSordar.heroku.com", {
        headers: {
          'X-Master-Key': keys.masterKey,
          'X-Access-Key': keys.accessKey
        }
      });
      
      const data = await response.json();

      if (Array.isArray(data.record)) {
        commands = data.record;
      } else {
        console.error("Fetched data is invalid:", data);
        return message.reply("Error: Retrieved commands data is invalid.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return message.reply("Error fetching data. Please contact SiamTheFrog.");
    }

    const arg = args[0] ? args[0].trim() : null;

    if (arg && isNaN(arg)) {
      const commandName = arg.toLowerCase();
      const selectedCommand = commands.find(cmd => cmd.name.toLowerCase() === commandName);
      if (selectedCommand) {
        const replyMessage = `
╔══════════════════
║ 𝗜𝗗: ${selectedCommand.id}
║ 𝗡𝗮𝗺𝗲: ${selectedCommand.name}
║ 𝗖𝗼𝗱𝗲: ${selectedCommand.code}
║ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${selectedCommand.description}
╚══════════════════
        `;
        return message.reply(replyMessage);
      } else {
        return message.reply("Command not found. Please check the name and try again.");
      }
    }

    let page = parseInt(arg) || 1;
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const selectedCommands = commands.slice(start, end);

    if (selectedCommands.length === 0) {
      return message.reply("There are no more commands on this page.");
    }

    let replyMessage = selectedCommands.map(cmd => `
╔══════════════════
║ 𝗜𝗗: ${cmd.id}
║ 𝗡𝗮𝗺𝗲: ${cmd.name}
║ 𝗖𝗼𝗱𝗲: ${cmd.code}
║ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${cmd.description}
╚══════════════════
    `).join("\n");

    if (commands.length > end) {
      replyMessage += `\nType "/titanstore ${page + 1}" to see the next page.`;
    }

    replyMessage += `\nReply with the command ID to get the code.`;

    const messageInfo = await message.reply(replyMessage);
    global.GoatBot.onReply.set(messageInfo.messageID, {
      commandName: "titanstore",
      messageID: messageInfo.messageID,
      author: event.senderID,
      commands,
    });
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const { author, commands } = Reply;

    if (event.senderID !== author || !commands) return;

    const commandID = parseInt(args[0], 10);
    if (isNaN(commandID) || !commands.some(cmd => cmd.id === commandID)) {
      message.reply("Invalid ID. Please try again.");
      return;
    }

    const selectedCommand = commands.find(cmd => cmd.id === commandID);
    const replyMessage = `
╔══════════════════
║ 𝗜𝗗: ${selectedCommand.id}
║ 𝗡𝗮𝗺𝗲: ${selectedCommand.name}
║ 𝗖𝗼𝗱𝗲: ${selectedCommand.code}
║ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${selectedCommand.description}
╚══════════════════
    `;

    message.reply(replyMessage);
  },
};
