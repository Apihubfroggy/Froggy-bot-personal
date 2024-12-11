module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    author: "Siam",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    shortDescription: "Show bot uptime",
    longDescription: "Displays how long the bot has been online in days, hours, minutes, and seconds.",
    category: "tools",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    const totalSeconds = Math.floor(process.uptime());
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    const uptimeMessage = `🟢 Bot Uptime:\n` +
                          `====================\n` +
                          `Days: ${days}\n` +
                          `Hours: ${hours}\n` +
                          `Minutes: ${minutes}\n` +
                          `Seconds: ${seconds}\n` +
                          `====================`;

    api.sendMessage(uptimeMessage, threadID, messageID);
  }
};
