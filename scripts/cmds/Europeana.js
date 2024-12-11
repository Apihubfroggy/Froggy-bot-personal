const axios = require("axios");

module.exports = {
    config: {
        name: "europeana",
        aliases: ["peana"],
        version: "1.3",
        countdown: 5,
        role: 0,
        author: "SiamTheFrog",
        shortDescription: "Get previous old pictures, paintings by query",
        longDescription: "",
        category: "image",
        guide: "{pn} <search query> example /peana Sheikh Hasina"
    },

    onStart: async function ({ message, args }) {
        if (args.length === 0) {
        
            return message.reply("Please provide a search term to find relevant art paintings.");
        }

        try {
            const MasterMind = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json?Mastermind-bruhh");
            
            const { accessKey, masterKey } = MasterMind.data;

            const ApiUrl = await axios.get("https://api.jsonbin.io/v3/b/675055c8e41b4d34e45fad8a?api=europeana.api.SiamTheFrog.herokuapp.com", {
                headers: {
                    "X-Master-Key": masterKey,
                    "X-Access-Key": accessKey
                }
            });
            const { api, froggy } = ApiUrl.data.record;

            const query = args.join(" ");
            
            const SiamTheFrog = `${api}/record/v2/search.json?wskey=${froggy}&query=${encodeURIComponent(query)}&rows=50&media=true&profile=rich`;

            const response = await axios.get(SiamTheFrog);
            const data = response.data;

            if (!data.items || data.items.length === 0) {
                return message.reply(`No relevant art paintings found for "${query}".`);
            }

            const randomItem = data.items[Math.floor(Math.random() * data.items.length)];
            const title = randomItem.title?.[0] || "No title available";
            
            const imageUrl = randomItem.edmPreview?.[0];

            if (imageUrl) {
                await message.reply({
                
                    body: `Title: ${title}`,
                    attachment: await axios({
                        url: imageUrl,
                        responseType: "stream"
                    }).then(res => res.data)
                });
                
            } else {
                await message.reply(`Title: ${title}\nNo image available.`);
            }
        } catch (error) {
        
            console.error(error);
            
            return message.reply("An error occurred Contact SiamTheFrog.");
        }
    }
};
