const fetch = require('node-fetch');

module.exports = {
  config: {
    name: 'pinhaven',
    version: '1.2.1',
    aliases: ['hav'],
    role: 2,
    author: 'SiamTheFrog',
    countdown: 10,
    category: 'media',
    shortDescription: 'Search pins across all categories.',
    longDescription:
      'get all category image.',
  },

  onStart: async function ({ message, args }) {
    if (!args.length) {
      return message.reply(
        'Please provide a search keyword and count, e.g., /pinhaven tsunade sexy 3.'
      );
    }

    const queryArgs = args.slice(0, args.length - 1).join(' ').toLowerCase();
    const count = parseInt(args[args.length - 1], 10) || 1;

    if (count < 1 || count > 50) {
      return message.reply('Please provide a count between 1 and 50.');
    }

    let categories = '111'; 
    let purity = '110'; 

    const nsfwKeywords = ['sexy', 'hot', 'nude'];
    if (nsfwKeywords.some((word) => queryArgs.includes(word))) {
      categories = '010'; 
      purity = '111'; 
    }

    try {
      
      const MasterMind = await fetch(
        'https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json?mastermind-bruh'
      );
      if (!MasterMind.ok) throw new Error('Error contact SiamTheFrog.');

      const masterMindData = await MasterMind.json();
      const masterKey = masterMindData.masterKey;
      const accessKey = masterMindData.accessKey;

      const ApiUrl = await fetch(
        'https://api.jsonbin.io/v3/b/67496d0aad19ca34f8d26aae?Api-V1-pinhaven.herokuapp.com',
        {
          headers: {
            'X-Master-Key': masterKey,
            'X-Access-Key': accessKey,
          },
        }
      );
      if (!ApiUrl.ok) throw new Error('Error contact SiamTheFrog.');

      const configData = await ApiUrl.json();
      const Frog = configData.record.api;
      const SiamTheFrog = configData.record.SiamTheFrog;

      const fullApiUrl = `${Frog}/v1/search?q=${encodeURIComponent(
        queryArgs
      )}&categories=${categories}&purity=${purity}&sorting=relevance&atleast=1920x1080&apikey=${SiamTheFrog}`;

      const response = await fetch(fullApiUrl);
      if (!response.ok) throw new Error('Failed to fetch pins.');

      const data = await response.json();
      const pins = data.data;

      if (pins.length === 0) {
        return message.reply(`No pins found for query: "${queryArgs}".`);
      }

      const selectedPins = pins.sort(() => 0.5 - Math.random()).slice(0, count);

      const attachments = [];
      for (let pin of selectedPins) {
        const imageStream = await global.utils.getStreamFromURL(pin.path);
        attachments.push(imageStream);
      }

      message.reply({
        body: `Here are ${attachments.length} pins for your query: "${queryArgs}"`,
        attachment: attachments,
      });
    } catch (error) {
      console.error('Error fetching pins:', error);
      return message.reply('❌ An error occurred while fetching pins. Please try again later.');
    }
  },
};
