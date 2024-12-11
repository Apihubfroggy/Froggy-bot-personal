const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  config: {
    name: "cricket",
    version: "1.0",
    author: "SiamTheFrog",
    aliases: ["score", "cric"],
    countDown: 5,
    role: 0,
    shortDescription: "Fetch live cricket scores",
    longDescription: "Fetches live cricket score",
    category: "entertainment",
    guide: "{pn}",
  },
  onStart: async function ({ message, api, event }) {
    try {
      
      const Mastermind = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
      const masterKey = Mastermind.data.masterKey;

      
      const Api = await axios.get("https://api.jsonbin.io/v3/b/673f73b1acd3cb34a8ac62ca?host=cricket.herokuapp.com", {
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": masterKey,
        },
      });
      
      const url = Api.data.record.url; 
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      const matchElement = $(".ds-flex.ds-flex-col.ds-mt-2.ds-mb-2").first();
      const team1 = matchElement.find(".ci-team-score").first();
      const team2 = matchElement.find(".ci-team-score").last();

      const team1Name = team1.find("p").text() || "Unknown Team 1";
      const team1Score = team1.find("strong").text().split("/") || [];
      const team1Runs = team1Score[0] || "N/A";
      const team1Wickets = team1Score[1] || "N/A";

      const team2Name = team2.find("p").text() || "Unknown Team 2";
      const team2Score = team2.find("strong").text().split("/") || [];
      const team2Runs = team2Score[0] || "N/A";
      const team2Wickets = team2Score[1] || "N/A";

      const matchDetails = team2
        .find("span")
        .text()
        .trim()
        .match(/(\d+) ov, T:(\d+)/);
      const overs = matchDetails ? matchDetails[1] : "N/A";
      const targetMinutes = matchDetails ? matchDetails[2] : "N/A";

      const team1TotalRuns = parseInt(team1Runs);
      const team2TotalRuns = parseInt(team2Runs);

      let firstBattingTeam = team1TotalRuns > team2TotalRuns ? team1Name : team2Name;
      let targetRuns = firstBattingTeam === team1Name ? team1TotalRuns + 1 : team2TotalRuns + 1;

      const runDifference = Math.abs(team1TotalRuns - team2TotalRuns);
      const winningTeam = team1TotalRuns > team2TotalRuns ? team1Name : team2Name;
      const losingTeam = team1TotalRuns > team2TotalRuns ? team2Name : team1Name;

      const resultMessage = `
        🎉 **Match Result** 🎉

        🏆 **Winner**: ${winningTeam} 
        💥 **By Runs**: ${runDifference} runs
        
        🏏 **Target Set**: ${targetRuns} runs
        
        💪 **Loser**: ${losingTeam}
      `;

      const messageBody = `
        🏏 **Live Cricket Score** 🏏

        **Team 1**: ${team1Name}
        - Score: ${team1Runs} 🏅
        - Wickets: ${team1Wickets} ⚔️

        **Team 2**: ${team2Name}
        - Score: ${team2Runs} 🏅
        - Wickets: ${team2Wickets} ⚔️

        ⏰ **Time**: ${targetMinutes} minutes
        🔄 **Overs**: ${overs}

        ${resultMessage}
      `;

      await api.sendMessage(messageBody, event.threadID, event.messageID);
    } catch (error) {
      console.error(`Error fetching the URL: ${error}`);
      await api.sendMessage(
        `❌ Error fetching the live cricket score: ${error.message}`,
        event.threadID,
        event.messageID,
      );
    }
  },
};
