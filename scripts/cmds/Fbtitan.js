const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
	config: {
		name: "fbtitan",
		version: "1.0",
		author: "TeamTitans>ðŸ¸",
		category: "media",
		shortDescription: "Download audio or video from Facebook",
		longDescription: "Provide a Facebook video URL to download audio or video (public videos only)",
		guide: "{pn} v <url> - Download a Facebook video using its URL.\n{pn} a <url> - Download audio from a Facebook video using its URL.",
		aliases: ["titan", "t", "f"]
	},

	onStart: async function ({ args, message, event }) {
		let videoUrl;
		let type = args[0] ? args[0].toLowerCase() : null;

		if (args.length > 1) {
			videoUrl = args[1];
		} else {
			const attachments = event.messageReply.attachments;
			if (!attachments || attachments.length === 0) {
				return message.reply("Please provide a Facebook video URL or reply to a message with an attached video.");
			}
			videoUrl = attachments[0].url;
		}

		const urlPattern = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+$/;
		if (!urlPattern.test(videoUrl)) {
			return message.reply("Please provide a valid Facebook video URL.");
		}

		if (type === 'v') {
			const response = await downloadVideoFromFacebook(videoUrl);
			if (!response.success) return message.reply("There was an error downloading the video. Please check the URL.");

			let downloaded = false;

			for (const item of response.download) {
				const res = await axios({
					url: item.url,
					responseType: 'stream'
				});
				if (parseInt(res.headers['content-length']) > 87031808) continue;
				res.data.path = `downloaded_${Math.random().toString(36).substring(2, 8)}.mp4`;
				message.reply({
					attachment: res.data
				});
				downloaded = true;
				break;
			}

			if (!downloaded) {
				return message.reply("The video is too large to download (limit: 100MB).");
			}
		} else if (type === 'a') {
			const response = await downloadAudioFromFacebook(videoUrl);
			if (!response.success) return message.reply("There was an error downloading the audio. Please check the URL.");

			let downloaded = false;

			for (const item of response.download) {
				const res = await axios({
					url: item.url,
					responseType: 'stream'
				});
				if (parseInt(res.headers['content-length']) > 87031808) continue;
				res.data.path = `downloaded_${Math.random().toString(36).substring(2, 8)}.mp3`;
				message.reply({
					attachment: res.data
				});
				downloaded = true;
				break;
			}

			if (!downloaded) {
				return message.reply("The audio is too large to download (limit: 100MB).");
			}
		} else {
			return message.reply("Please specify 'v' for video or 'a' for audio.");
		}
	}
};

async function downloadVideoFromFacebook(url) {
	try {
		const { data } = await axios.get('https://Siamfroggy.github.io/fb-github.io/Fb.json');
		const response = await axios.post(data.snapsaveApiUrl, new URLSearchParams({ url }), {
			headers: {
				"accept": "*/*",
				"content-type": "application/x-www-form-urlencoded",
				"Referer": data.referer,
			}
		});

		if (response.status !== 200) {
			return { success: false };
		}

		let html;
		const evalCode = response.data.replace('return decodeURIComponent', 'html = decodeURIComponent');
		eval(evalCode);
		html = html.split('innerHTML = "')[1].split('";\n')[0].replace(/\\"/g, '"');

		const $ = cheerio.load(html);
		const downloadLinks = [];

		$('table tbody tr').each((i, elem) => {
			const quality = $(elem).find('td').eq(0).text().trim();
			const videoUrl = $(elem).find('td').eq(2).children('a').attr('href');
			if (videoUrl) {
				downloadLinks.push({ quality, url: videoUrl });
			}
		});

		return { success: true, download: downloadLinks };
	} catch (error) {
		console.error("Download Error: ", error);
		return { success: false };
	}
}

async function downloadAudioFromFacebook(url) {
	try {
		const { data } = await axios.get('https://Siamfroggy.github.io/fb-github.io/Fb.json');
		const response = await axios.post(data.snapsaveApiUrl, new URLSearchParams({ url }), {
			headers: {
				"accept": "*/*",
				"content-type": "application/x-www-form-urlencoded",
				"Referer": data.referer,
			}
		});

		if (response.status !== 200) {
			return { success: false };
		}

		let html;
		const evalCode = response.data.replace('return decodeURIComponent', 'html = decodeURIComponent');
		eval(evalCode);
		html = html.split('innerHTML = "')[1].split('";\n')[0].replace(/\\"/g, '"');

		const $ = cheerio.load(html);
		const downloadLinks = [];

		$('table tbody tr').each((i, elem) => {
			const quality = $(elem).find('td').eq(0).text().trim();
			const audioUrl = $(elem).find('td').eq(2).children('a').attr('href');
			if (audioUrl) {
				downloadLinks.push({ quality, url: audioUrl });
			}
		});

		return { success: true, download: downloadLinks };
	} catch (error) {
		console.error("Download Error: ", error);
		return { success: false };
	}
}
