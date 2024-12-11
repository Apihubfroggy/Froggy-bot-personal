const axios = require("axios");
const fetch = require('node-fetch');

let usedGifs = [];

module.exports = {
  config: {
    name: 'gif',
    version: '1.0.0',
		role: 0,
    author: 'SiamTheFrog',
		category: 'media',
    shortDescription: 'Get random GIFs based on your search terms.',
    longDescription: 'Search for GIFs by providing keywords and a count for GIFs.',
  },

  onStart: async function ({ message, args }) {
    const counts = parseInt(args.pop());
    const queries = args;

    if (queries.length === 0 || isNaN(counts)) {
      return message.reply('Usage: /gif <keyword1> <keyword2> ... <count>');
    }

    const ApiUrl = "https://api.jsonbin.io/v3/b/671e12d5e41b4d34e4498e44?host=SiamTheFrog.heroku.com"; 
    const mastermindURL = "https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json";

    try {
      const keyResponse = await axios.get(mastermindURL);
      const accessKey = keyResponse.data.accessKey;
      const masterKey = keyResponse.data.masterKey;

      const configResponse = await axios.get(ApiUrl, {
        headers: {
          "X-Access-Key": accessKey,
          "X-Master-Key": masterKey
        }
      });

      const apiUrl = configResponse.data.record.api;
      const apiKey = configResponse.data.record.apiKey;

      const gifs = [];
      const searchUrl = `${apiUrl}?api_key=${apiKey}&q=${encodeURIComponent(queries.join(' '))}&limit=100`;

      const response = await fetch(searchUrl);
      if (!response.ok) throw new Error('Failed to fetch GIFs.');

      const data = await response.json();
      const gifUrls = data.data.map(gif => gif.images.original.url).filter(url => !usedGifs.includes(url));

      if (gifUrls.length === 0) {
        return message.reply(`No unique GIFs found for queries: "${queries.join(', ')}".`);
      }

      while (gifs.length < counts && gifUrls.length > 0) {
        const randomIndex = Math.floor(Math.random() * gifUrls.length);
        gifs.push(gifUrls[randomIndex]);
        gifUrls.splice(randomIndex, 1);
      }

      usedGifs.push(...gifs);

      const attachments = await Promise.all(gifs.map(url => global.utils.getStreamFromURL(url)));
      message.reply({
        body: `Here are your GIFs for ${queries.length > 1 ? 'queries' : 'query'}: "${queries.join(', ')}":`,
        attachment: attachments
      });
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      return message.reply('âŒ An error occurred while fetching the GIFs. Contact SiamTheFrog.');
    }
  },
};  
