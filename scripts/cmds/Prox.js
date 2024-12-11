const axios = require("axios");

module.exports = {
  config: {
    name: "prox",
    version: "1.0",
    author: "SiamTheFrog",
    role: 0,
    description: 'Generate image based on text using selected models.',
    category: "image",
    guide: {
      en: `{pn} your prompt models\n
1. 1.4k hidox v1
2. pro asux v2
3. pro lox v1
4. Realistic pro visuall v5
5. Realistic flux org dev 1
6. elixa v2
7. pro vision 5
8. Realistic prox v10
9. Realistic gux v2
10. Realistic luz v3`
    }
  },
  
  onStart: async function ({ message, api, args }) {
    if (args.length < 2) {
      return message.reply("Please provide a prompt and a model number (1-10).\nExample: /prox cow 3");
    }

    const prompt = args.slice(0, -1).join(' ').trim();
    const modelNumber = args[args.length - 1];

    if (isNaN(modelNumber) || modelNumber < 1 || modelNumber > 10) {
      return message.reply("Invalid model number. Please provide a model number between 1 and 10.\nExample: /prox cow 3");
    }

    try {
      
      const masterKeyResponse = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
      const masterKey = masterKeyResponse.data.masterKey;
      const accessKey = masterKeyResponse.data.accessKey;

      const jsonData = await axios.get("https://api.jsonbin.io/v3/b/6720dcaae41b4d34e44ac1d8?host=prox-SiamTheFrog.heroku.com", {
        headers: {
          "X-Master-Key": masterKey,
          "X-Access-Key": accessKey
        }
      });

      const modelMap = jsonData.data.record.modelMap;
      const apiEndpoint = jsonData.data.record.apiEndpoint;
      const selectedModel = modelMap[modelNumber];

      const endpoint = `${apiEndpoint}?prompt=${encodeURIComponent(prompt)}&model=${selectedModel.id}`;

      const startTime = new Date().getTime();

      const imageStream = await global.utils.getStreamFromURL(endpoint);
      const endTime = new Date().getTime();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

      message.reply({
        body: `ðŸ”® Prompt: "${prompt}"\nðŸ” Model ${modelNumber}: ${selectedModel.name}\nðŸ•‘ Time taken: ${timeTaken} seconds`,
        attachment: imageStream
      });
    } catch (error) {
      console.error("Error fetching image contact SiamTheFrog:", error);
      message.reply("Error occurred while generating the image. Contact SiamTheFrog");
    }
  }
};
