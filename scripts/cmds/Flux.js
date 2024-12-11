const x = require("axios");

module.exports.config = {
  name: "flux",
  version: "1.0.0.0",
  role: 2,
  author: "SiamTheFrog",
  description: "flux Image Generator",
  countDown: 30,
  category: "media",
  guide: "{pn} [prompt]",
};

module.exports.onStart = async ({ message, args }) => {
  try {
    const a = args.join(" ");
    if (!a) return message.send("Please provide a prompt.");

    const start = Date.now(); 

    const m = await x.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json");
    const { masterKey: mk, accessKey: ak } = m.data;

    if (!mk || !ak) {
      message.send("Error: Contact SiamTheFrog.");
      return;
    }

    const c = await x.get("https://api.jsonbin.io/v3/b/673f4e57ad19ca34f8cdd015?flux=SiamTheFrog.herokuapp.com", {
      headers: { "X-Master-Key": mk, "X-Access-Key": ak },
    });

    const u = c.data.record.api_url;

    if (!u) {
      message.send("Error: Contact SiamTheFrog.");
      return;
    }

    const d = await x.get(`${u}?prompt=${encodeURIComponent(a)}`);

    const end = Date.now(); 
    const timeTaken = ((end - start) / 1000).toFixed(2); 

    await message.send({
      body: `🎨 Prompt: ${a}\n⏱ Time Taken: ${timeTaken} seconds`,
      attachment: await global.utils.getStreamFromURL(d.data.data),
    });
  } catch (e) {
    console.error(e);
    message.send("Error: Contact SiamTheFrog.");
  }
};
