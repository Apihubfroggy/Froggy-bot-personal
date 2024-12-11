const axios = require('axios');
const apiConfigUrl = 'https://Siamfroggy.github.io/Age-github.io/AgeFrogbaseApiUrl.json';

module.exports = {
  config: {
    name: 'age',
    version: '1.0.0',
    author: 'SiamTheFrog',
    countDown: 0,
    role: 0,
    category: 'fun',
    shortDescription: 'Predict age based on name',
    longDescription: 'Fetches predicted age for a given name',
    guide: {
      en: '{pn} <name>',
    },
  },

  onStart: async function ({ api, event, message }) {
    const args = event.body.split(' ').slice(1);
    const apiConfig = await fetchApiConfig();

    if (args.length === 0) {
      return message.reply('Please provide a name.');
    }

    const name = args.join(' ');

    try {
      const response = await axios.get(`${apiConfig.agifyApi.url}&name=${name}`);
      const { age, count } = response.data;

      if (age && count) {
        message.reply(`The predicted age for the name "${name}" is ${age} years (based on ${count} records).`);
      } else {
        message.reply('Unable to predict the age for the provided name.');
      }
    } catch (error) {
      message.reply(`Error fetching age data: ${error.message}`);
    }
  },
};

async function fetchApiConfig() {
  const response = await axios.get(apiConfigUrl);
  return response.data;
}
