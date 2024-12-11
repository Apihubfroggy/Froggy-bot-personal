const axios = require("axios");
const fs = require("fs");

module.exports = {
    config: {
        name: "bg",
        version: "1.0.0",
        role: 0,
        aliases: [],
        author: "SiamTheFrog",
        countdown: 15,
        category: "Image",
        shortDescription: "Remove any image background",
        longDescription: "Removes the background from an image. Reply to an image or provide an image URL to use the command."
    },

    onStart: async function ({ message, event, args }) {
        let imageUrl;

        if (event.type === "message_reply" && event.messageReply.attachments[0]?.type === "photo") {
            imageUrl = event.messageReply.attachments[0].url;
        } 
        else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/)) {
            imageUrl = args[0];
        } 
        else {
            return message.reply("Please reply to an image or provide a valid image URL.");
        }

        const processingMessage = await message.reply("Processing your image.....🐸");

        try {
            const MasterMind = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json?mastermind-bruhh");
            const { accessKey, masterKey } = MasterMind.data;
            
            const ApiUrl = await axios.get("https://api.jsonbin.io/v3/b/674b3403e41b4d34e45d71e8?Removebg-Api-V1.herokuapp.com", {
                headers: {
                    "X-Master-Key": masterKey,
                    "X-Access-Key": accessKey
                }
            });
            const { api, apiKey } = ApiUrl.data.record;

            const response = await axios.post(
                api,
                { image_url: imageUrl, size: "auto" },
                {
                    headers: {
                        "X-Api-Key": apiKey,
                        "Content-Type": "application/json"
                    },
                    responseType: "arraybuffer"
                }
            );

            const fileName = `bg_removed_${Date.now()}.png`;
            fs.writeFileSync(fileName, response.data);

            await message.reply({
                body: "Here is your image with the background removed:",
                attachment: fs.createReadStream(fileName)
            });

            fs.unlinkSync(fileName);
        } catch (error) {
            console.error("Error removing background:contact SiamTheFrog", error);
            message.reply("Failed to process the image. Please try again later.");
        }

        message.unsend(processingMessage.messageID);
    }
};
