const fetch = require('node-fetch');

module.exports = {
  config: {
    name: 'pixel',
    version: '1.0.0',
    role: 0,
    aliases: ['p'],
    author: 'SiamTheFrog',
    category: 'media',
    shortDescription: 'Get multiple images from Pexels based on your search query.',
    longDescription: 'Search for images from Pexels by providing a query and get multiple images in one response.',
  },

  onStart: async function ({ message, args }) {
    const query = args[0];
    const count = parseInt(args[1], 10) || 1;

    if (!query) {
      return message.reply('Please provide a search keyword, e.g., /pixel cat 5.');
    }

    const apiUrl = 'https://Siamfroggy.github.io/Pixel-github.io/TeamTitansbaseApiUrl.json';

    try {
      const configResponse = await fetch(apiUrl);
      const configData = await configResponse.json();

      if (configData.pixelApi.author !== 'SiamTheFrog') {
        return message.reply('Lado khao muji.🐸');
      }

      const apiKey = configData.pixelApi.apikey;
      const api = configData.pixelApi.api.replace('<query>', encodeURIComponent(query)).replace('<count>', count);

      const response = await fetch(api, {
        headers: { Authorization: apiKey }
      });

      if (!response.ok) throw new Error('Failed to fetch images contact SiamTheFrog.');

      const data = await response.json();
      const photos = data.photos;

      if (photos.length === 0) {
        return message.reply(`No images found for query: ${query}`);
      }

      const attachments = [];

      for (let photo of photos) {
        const imageStream = await global.utils.getStreamFromURL(photo.src.original);
        attachments.push(imageStream);
      }

      message.reply({
        body: `Here are ${attachments.length} images for your search query: "${query}"`,
        attachment: attachments
      });

    } catch (error) {
      console.error('Error fetching images:', error);
      return message.reply('An error occurred while fetching images. Contact SiamTheFrog.');
    }
  },
};
