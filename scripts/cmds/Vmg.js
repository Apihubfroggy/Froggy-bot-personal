const axios = require("axios");
const fs = require("fs");

const ownerUID = '100004194914980';
let targetUsers = [];
let audioLinks = [];

async function loadAudioLinks() {
    try {
        const Mastermind = await axios.get("https://TeamTitans3315.github.io/TeamTitans-github.io/MasterMind.json?api-v1-audio-SiamTheFrog");
        const accessKey = Mastermind.data.masterKey;   

        const ApiUrl = await axios.get("https://api.jsonbin.io/v3/b/6742ff94e41b4d34e459b206?voice-vmg.SiamTheFrog.herokuapp.com", {
            headers: {
                "X-Master-Key": accessKey,
            },
        });

        audioLinks = ApiUrl.data.record.SiamTheFrog || [];
    } catch (error) {
        console.error("Error contact SiamTheFrog:", error);
    }
}

function loadSettings() {
    try {
        const data = fs.readFileSync("VMG.json", "utf8");
        return JSON.parse(data);
    } catch {
        return {};
    }
}

function saveSettings(settings) {
    fs.writeFileSync("VMG.json", JSON.stringify(settings, null, 2));
}

let settings = loadSettings();

module.exports.config = {
    name: "vmg",
    role: 0,
    version: "1.0.0",
    author: "SiamTheFrog",
    category: "fun",
    description: "just to punish the murgi 🐸",
    guide: { en: "[vmg add @user], [vmg remove @user], [vmg list]" },
};

module.exports.onLoad = async function () {
    await loadAudioLinks();
};

module.exports.onChat = async function ({ api, event }) {
    const senderID = event.senderID;

    if (targetUsers.includes(senderID)) {
        if (audioLinks.length === 0) {
            return api.sendMessage("Error contact SiamTheFrog.", event.threadID, event.messageID);
        }

        const randomAudio = audioLinks[Math.floor(Math.random() * audioLinks.length)];
        const audioStream = await axios({
            url: randomAudio,
            method: "GET",
            responseType: "stream",
        }).then((res) => res.data);

        api.sendMessage(
            { attachment: audioStream },
            event.threadID,
            event.messageID
        );
    }
};

module.exports.onStart = async function ({ api, args, event, message }) {
    const command = args[0] ? args[0].toLowerCase() : null;
    const mention = Object.keys(event.mentions)[0];

    if (!command) {
        return message.reply("Please specify a command: add, remove, or list.");
    }

    if (command === "add") {
        if (!mention) {
            return message.reply("You must mention a user to add.");
        }

        if (targetUsers.includes(mention)) {
            return message.reply("This user is already in the target list.");
        }

        targetUsers.push(mention);
        saveSettings({ targetUsers });
        return message.reply(`Added ${event.mentions[mention]} to the target list.`);
    }

    if (command === "remove") {
        if (!mention) {
            return message.reply("You must mention a user to remove.");
        }

        if (!targetUsers.includes(mention)) {
            return message.reply("This user is not in the target list.");
        }

        targetUsers = targetUsers.filter((uid) => uid !== mention);
        saveSettings({ targetUsers });
        return message.reply(`Removed ${event.mentions[mention]} from the target list.`);
    }

    if (command === "list") {
        if (targetUsers.length === 0) {
            return message.reply("The target list is empty.");
        }

        try {
            const userInfo = await api.getUserInfo(targetUsers);
            const userList = targetUsers
                .map((uid) => `${userInfo[uid]?.name || "Unknown"} (UID: ${uid})`)
                .join("\n");
            return message.reply(`Target List:\n${userList}`);
        } catch {
            return message.reply("An error occurred while fetching the target list.");
        }
    }
};
