const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "logogen",
    aliases: ["logo"],
    version: "1.0.8",
    author: "SiamTheFrog",
    countDown: 10,
    role: 0,
    category: "image",
    shortDescription: "গCreate logo by selecting number",
    longDescription: "Generate a logo with a given name",
    guide: "{pn} <1|2|3|4|5|6|7|8|9|10> <text>",
  },
  onStart: async function ({ api, event, args, message }) {
    try {

      const Mastermind = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
      const masterKey = Mastermind.data.masterKey;

      const FrogApiUrl = await axios.get("https://api.jsonbin.io/v3/b/67408c8bacd3cb34a8acd8a2?logo-gen.api.herokuapp.com", {
        headers: {
          "X-Master-Key": masterKey,
        },
      });
      
      const { imageURLs, textStyles } = FrogApiUrl.data.record; 

      const logoType = args[0];
      const text = args.slice(1).join(" ");
      if (!["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(logoType) || !text) {
        return message.reply("Usage: /logo <1|2|3|4|5|6|7|8|9|10> <name>");
      }

      const selectedStyle = textStyles[logoType];
      const imageURL = imageURLs[logoType];
      const outputPath = path.resolve(__dirname, `generated-logo-${logoType}.png`);


      const image = await loadImage(imageURL);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.font = selectedStyle.font;
      ctx.textAlign = "center";

      if (logoType === "6" || logoType === "7" || logoType === "8" || logoType === "9" || logoType === "10") {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        selectedStyle.gradient.forEach((color, index, arr) => gradient.addColorStop(index / (arr.length - 1), color));
        ctx.fillStyle = gradient;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.lineWidth = 8;
      } else {
        ctx.fillStyle = selectedStyle.fillStyle;
        ctx.strokeStyle = selectedStyle.strokeStyle;
        ctx.lineWidth = 6;
      }

      ctx.shadowColor = selectedStyle.shadowColor;
      ctx.shadowBlur = selectedStyle.shadowBlur;
      ctx.shadowOffsetX = selectedStyle.shadowOffsetX || 5;
      ctx.shadowOffsetY = selectedStyle.shadowOffsetY || 5;

      const textX = canvas.width / 2;
      const textY = canvas.height / 2;

      ctx.strokeText(text, textX, textY);
      ctx.fillText(text, textX, textY);


      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      message.reply(
        {
          body: `Logo generated for "${text}" on template ${logoType}`,
          attachment: fs.createReadStream(outputPath),
        },
        () => {
          fs.unlinkSync(outputPath); 
        }
      );
    } catch (error) {
      console.error(`Error: ${error.message}`);
      message.reply(`❌ Error generating the logo: ${error.message}`);
    }
  },
};
