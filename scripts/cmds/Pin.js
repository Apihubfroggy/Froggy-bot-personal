const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "pin",
		version: "1.0.3",
		author: "SiamTheFrog",
		role: 0,
		countDown: 5,
		shortDescription: "Search images from Pinterest",
		longDescription: "Fetch images from Pinterest based on your search query.",
		category: "image",
		guide: "{prefix}pin <query> <count>"
	},

	onStart: async function ({ api, event, args }) {
		try {
			const input = args.join(" ").trim();
			if (!input) {
				return api.sendMessage(
					"Please provide a query. Example: /pin <query> <count>",
					event.threadID,
					event.messageID
				);
			}

			const splitInput = input.split(" ");
			const query = splitInput.slice(0, -1).join(" ") || input;
			let count = parseInt(splitInput[splitInput.length - 1]);

			if (isNaN(count) || count <= 0) count = 1;

			const startTime = Date.now();

			const MasterMind = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json?Mastermind-bruhh");
			const { accessKey, masterKey } = MasterMind.data;

			const SiamTheFrog = await axios.get("https://api.jsonbin.io/v3/b/6750b45aad19ca34f8d5a812?Api=Pinterest-V1.herokuapp.com", {
				headers: {
					"X-Master-Key": masterKey,
					"X-Access-Key": accessKey
				}
			});
			const froggy = SiamTheFrog.data.record.api;

			const response = await axios.get(`${froggy}?pinte=${encodeURIComponent(query)}`);
			const images = response.data;

			if (!images || images.length === 0) {
				return api.sendMessage(`No results found for "${query}".`, event.threadID, event.messageID);
			}

			const selectedImages = images.sort(() => 0.5 - Math.random()).slice(0, count);

			const attachments = [];
			const titles = [];
			for (const [index, image] of selectedImages.entries()) {
				try {
					const imageBuffer = await axios.get(image.image, { responseType: "arraybuffer" });
					const imagePath = path.join(__dirname, "cache", `image_${index + 1}.jpg`);
					await fs.outputFile(imagePath, imageBuffer.data);
					attachments.push(fs.createReadStream(imagePath));
					titles.push(image.title || "No Title");
				} catch (error) {
					console.error(`Failed to fetch image: ${error.message}`);
				}
			}

			const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

			if (attachments.length === 0) {
				return api.sendMessage(`Unable to fetch images for "${query}".`, event.threadID, event.messageID);
			}

			const messageBody = `Here are ${attachments.length} images for "${query}":
Time Taken: ${timeTaken} seconds
Sources:\n${titles.map((title, i) => `${i + 1}. ${title}`).join("\n")}`;

			await api.sendMessage({
				body: messageBody,
				attachment: attachments
			}, event.threadID, event.messageID);

			await fs.remove(path.join(__dirname, "cache"));
		} catch (error) {
			console.error(`Error: ${error.message}`);
			api.sendMessage("An error occurred. Please try again later.", event.threadID, event.messageID);
		}
	}
};
