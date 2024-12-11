const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { randomString } = global.utils;

const blockedUsers = [];
const adminUID = '100004194914980';

module.exports = {
  config: {
    name: 'song',
    version: '1.0.0',
    author: 'SiamTheFrog',
    countDown: 10,
    role: 0,
    category: 'music',
    shortDescription: 'Play music from YouTube.',
    longDescription: 'Provide a song name to play the track from YouTube.And you can block anyone block unblock.',
    guide: {
      en: '{pn} song <Song Name>\nExample /song despacito\n/song block @mention or Uid\nsong list to see block list\n/song unblock @mention or uid',
    },
  },

  onStart: async function ({ message, event, args }) {
    if (args[0] === "block") {
      if (event.senderID !== adminUID) {
        return message.reply("You do not have permission to use this command.");
      }

      const mention = Object.keys(event.mentions)[0];
      const uidToBlock = mention || args[1]; 

      if (!uidToBlock) {
        return message.reply("Please mention a user or provide their UID to block.");
      }

      const name = event.mentions[uidToBlock] ? event.mentions[uidToBlock].replace('@', '') : uidToBlock;

      if (blockedUsers.some(user => user.id === uidToBlock)) {
        return message.reply("This user is already on the block list.");
      }

      blockedUsers.push({ id: uidToBlock, name });
      return message.reply(`@${name} has been blocked.`, event.threadID, {
        mentions: [{ id: uidToBlock, tag: name }]
      });
    }

    if (args[0] === "list") {
      if (blockedUsers.length === 0) {
        return message.reply("No users in the block list.");
      }

      let listMessage = "Block List:\n";
      blockedUsers.forEach((user, index) => {
        listMessage += `${index + 1}. UID: ${user.id}, Name: ${user.name}\n`;
      });

      return message.reply(listMessage);
    }

    if (args[0] === "unblock") {
      if (event.senderID !== adminUID) {
        return message.reply("You do not have permission to use this command.");
      }

      const mention = Object.keys(event.mentions)[0];
      const uidToUnblock = mention || args[1]; 

      if (!uidToUnblock) {
        return message.reply("Please mention a user or provide their UID to unblock.");
      }

      const index = blockedUsers.findIndex(user => user.id === uidToUnblock);
      if (index === -1) {
        return message.reply("This user is not on the block list.");
      }

      const name = blockedUsers[index].name;
      blockedUsers.splice(index, 1);
      return message.reply(`@${name} has been unblocked.`, event.threadID, {
        mentions: [{ id: uidToUnblock, tag: name }]
      });
    }

    if (blockedUsers.some(user => user.id === event.senderID)) {
      const adminName = blockedUsers.find(user => user.id === adminUID)?.name || "Admin";
      return message.reply(`You are blocked. You cannot use this command. Please contact ${adminName}.`);
    }

    const input = args.join(" ");
    if (!input) return message.reply("Please provide a song name!");

    const mastermindURL = "https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json";
    const apiUrl = "https://api.jsonbin.io/v3/b/6723b0ece41b4d34e44bf949?host=Song-SiamTheFrog.heroku.com";

    try {
      const keyResponse = await axios.get(mastermindURL);
      const accessKey = keyResponse.data.accessKey;
      const masterKey = keyResponse.data.masterKey;

      const configResponse = await axios.get(apiUrl, {
        headers: {
          "X-Access-Key": accessKey,
          "X-Master-Key": masterKey
        }
      });

      const youtubeApiKey = configResponse.data.record.youtubeApi.apiKey;
      const youtubeSearchUrl = `${configResponse.data.record.youtubeApi.searchUrl}?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(input)}&key=${youtubeApiKey}`;

      const youtubeResponse = await axios.get(youtubeSearchUrl);
      const videoId = youtubeResponse.data.items?.[0]?.id?.videoId;
      if (!videoId) return message.reply("Couldn't find the song. Please try again. Error contact SiamTheFrog");

      const videoDetailsUrl = `${configResponse.data.record.youtubeApi.videoDetailsUrl}?part=statistics,snippet,contentDetails&id=${videoId}&key=${youtubeApiKey}`;
      const videoDetailsResponse = await axios.get(videoDetailsUrl);
      const videoDetails = videoDetailsResponse.data.items?.[0];

      const channel = videoDetails?.snippet?.channelTitle;
      const publishedAt = new Date(videoDetails?.snippet?.publishedAt).toLocaleDateString();
      const comments = videoDetails?.statistics?.commentCount; 
      const views = videoDetails?.statistics?.viewCount; 
      const likes = videoDetails?.statistics?.likeCount; 
      const duration = videoDetails?.contentDetails?.duration;

      const formattedDuration = duration.replace(/PT(\d+H)?(\d+M)?(\d+S)?/, (match, hours, minutes, seconds) => {
        const h = hours ? `${parseInt(hours)} hour${parseInt(hours) > 1 ? 's' : ''}` : '';
        const m = minutes ? `${parseInt(minutes)} minute${parseInt(minutes) > 1 ? 's' : ''}` : '';
        const s = seconds ? `${parseInt(seconds)} second${parseInt(seconds) > 1 ? 's' : ''}` : '';
        return [h, m, s].filter(Boolean).join(' ') || '0 seconds';
      });

      const formattedComments = Number(comments) >= 1e3 ? `${(Number(comments) / 1e3).toFixed(1)}k` : comments;
      const formattedViews = Number(views) >= 1e9 ? `${(Number(views) / 1e9).toFixed(1)} billion` : 
                          Number(views) >= 1e6 ? `${(Number(views) / 1e6).toFixed(1)} million` : 
                          `${views} views`;

      const formattedLikes = Number(likes) >= 1e9 ? `${(Number(likes) / 1e9).toFixed(1)} billion` : 
                          Number(likes) >= 1e6 ? `${(Number(likes) / 1e6).toFixed(1)} million` : 
                          `${likes} likes`;

      const downloadUrl = `${configResponse.data.record.audioDownload.downloadUrl}?url=https://www.youtube.com/watch?v=${videoId}`;
      const songData = await axios.get(downloadUrl);

      const audioDownloadLink = songData.data.data?.downloadUrl;
      if (!audioDownloadLink) return message.reply("There was an issue downloading the song. Please try again. Error contact SiamTheFrog");

      const audioFilePath = path.resolve(__dirname, `${randomString()}.mp3`);
      const writer = fs.createWriteStream(audioFilePath);

      const startTime = Date.now();

      const downloadStream = await axios({
        url: audioDownloadLink,
        method: 'GET',
        responseType: 'stream'
      });
      downloadStream.data.pipe(writer);

      writer.on('finish', async () => {
        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(0);
        const responseMessage = `
          🎵 Playing: ${input}
          Channel: ${channel}
          Views: ${formattedViews}
          Likes: ${formattedLikes}
          Comments: ${formattedComments}
          Published date: ${publishedAt}
          Duration: ${formattedDuration}
          Time taken: ${timeTaken} seconds
        `;
        await message.reply({
          body: responseMessage,
          attachment: fs.createReadStream(audioFilePath)
        });
        fs.unlink(audioFilePath, (err) => {
          if (err) console.error("Error Contact SiamTheFrog:", err);
        });
      });

      writer.on('error', (err) => {
        console.error("Error during download:", err);
        message.reply("Error occurred while fetching the song. Error contact SiamTheFrog");
      });

    } catch (error) {
      console.error("Playback Error:", error);
      message.reply("There was an issue fetching the song. Please try again.");
    }
  }
};
