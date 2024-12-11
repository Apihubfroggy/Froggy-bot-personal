const fetch = require('node-fetch');
const axios = require('axios');

module.exports = {
  config: {
    name: 'meme',
    version: '1.0.0',
    author: 'SiamTheFrog',
    category: 'media',
    shortDescription: 'Get random english memes.',
    longDescription: 'get random meme images with optional count.',
  },

  onStart: async function ({ message, args }) {
    const count = isNaN(args[0]) ? 1 : Math.min(parseInt(args[0]), 10);
    const apiUrl = 'https://api.jsonbin.io/v3/b/671fae6dad19ca34f8bffcaa?host=SiamTheFrog.heroku.com';
    const mastermindURL = "https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json";

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

      const memeApiUrl = configResponse.data.record.memeApi;
      const memes = [];

      for (let i = 0; i < count; i++) {
        const response = await fetch(memeApiUrl);
        if (!response.ok) throw new Error('Failed to fetch meme.Contact SiamTheFrog');

        const data = await response.json();
        memes.push(await global.utils.getStreamFromURL(data.url));
      }

      message.reply({
        body: `Here ${count === 1 ? 'is' : 'are'} your meme${count === 1 ? '' : 's'}!`,
        attachment: memes
      });
    } catch (error) {
      console.error('Error fetching memes:', error);
      return message.reply('❌ Could not fetch memes at the moment.Contact SiamTheFrog.');
    }
  },
};
