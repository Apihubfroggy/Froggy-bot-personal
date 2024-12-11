const axios = require("axios");
const fs = require("fs");

const encodedAuthor = 'U2lhbVRoZUZyb2c=';
if (Buffer.from(encodedAuthor, 'base64').toString('utf-8') !== 'SiamTheFrog') {
    throw new Error("Don't change author randi.");
}

const ownerUID = '100004194914980';//Add your uid
let ignoredUIDs = [];
let adminList = [];

async function loadIgnoredUIDs() {
    try {
        const response = await axios.get("https://Siamfroggy.github.io/SiamTheFrog-github.io/SiamTheFrog.json");
        ignoredUIDs = response.data.ignoredUIDs;
        adminList = response.data.adminList || [];
    } catch (e) {
        console.error("Error loading ignored UIDs and admin list: ", e);
    }
}

function loadSettings() {
    try {
        const data = fs.readFileSync("Frog.json", "utf8");
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

function saveSettings(settings) {
    fs.writeFileSync("Frog.json", JSON.stringify(settings, null, 2));
}

let settings = loadSettings();
let targetUsersBN = [];
let targetUsersEN = [];

module.exports.config = {
    name: "mg",
    version: "1.0.0",
    role: 0,
    author: "SiamTheFrog",
    description: "Just to punish the murgi",
    guide: { en: "[mg add bn @user], [mg add en @user], [mg remove bn @user], [mg remove en @user], [mg admin add @user], [mg admin remove @user], [mg on], [mg off], [mg list], [mg admin list]" },
    category: "fun",
    coolDowns: 0,
};
async function fetchMessages(language) {


    let url = language === 'bn' ? 

              'https://Siamfroggy.github.io/bangla-murgi-github.io/SiamThefrog.json' : 

              'https://Siamfroggy.github.io/Frog-English-github.io/EnglishFrog.json';
    try {

        const response = await axios.get(url);

        return response.data.messages;

    } catch (error) {

        console.error("Error fetching messages: ", error);

        return [];

    }

}

function isAdmin(userID) {

    return userID === ownerUID || adminList.includes(userID);
}

module.exports.onChat = async function ({ api, event }) {

    const senderID = event.senderID;

    if (settings[event.threadID] === 'off') return;

    const isTargetBN = targetUsersBN.includes(senderID);

    const isTargetEN = targetUsersEN.includes(senderID);

    let abusiveReplies = [];

    if (isTargetBN) {

        abusiveReplies = await fetchMessages('bn');

    } else if (isTargetEN) {

        abusiveReplies = await fetchMessages('en');

    }

    if (abusiveReplies.length > 0) {

        const randomReply = abusiveReplies[Math.floor(Math.random() * abusiveReplies.length)];

        await api.sendMessage(

            randomReply,

            event.threadID,

            (error, info) => {

                if (error) {

                    console.error(error);

                } else {

                    global.GoatBot.onChat.set(info.messageID, {

                        commandName: this.config.name,

                        type: "reply",

                        messageID: info.messageID,

                        author: event.senderID,

                        link: randomReply,

                    });

                }

            },

            event.messageID
        );
    }
};

module.exports.onStart = async function ({ api, args, event, message }) {

    const authorName = module.exports.config.author;

    if (authorName !== 'SiamTheFrog') {

        message.reply("Don't change author randi!");

        return;

    }

    const command = args[0] ? args[0].toLowerCase() : null;

    if (!isAdmin(event.senderID)) {

        return message.reply("You don't have permission to use this command.");
    }

    if (command === "off") {


        settings[event.threadID] = "off";


        saveSettings(settings);


        return message.reply("mg cmd has been disabled for this thread.");

    } 

    else if (command === "on") {

        delete settings[event.threadID];

        saveSettings(settings);

        return message.reply("mg cmd has been enabled for this thread.");

    }

    else if (command === "add") {

        const language = args[1];

        const mention = Object.keys(event.mentions)[0];


        if (language !== 'bn' && language !== 'en') {

            return message.reply("Please specify a valid language: 'bn' or 'en'.");

        }

        if (!mention) {

            return message.reply("You must mention a user to add.");

        }

        if (ignoredUIDs.includes(mention)) {

            return message.reply("Shut up nigga.");

        }

        if (language === 'bn') {

            if (targetUsersBN.includes(mention)) {

                return message.reply("This user is already added in the Bangla list.");

            }

            targetUsersBN.push(mention);

            return message.reply(`Added ${event.mentions[mention]} to the Bangla target list.`);

        } else if (language === 'en') {

            if (targetUsersEN.includes(mention)) {

                return message.reply("This user is already added in the English list.");

            }

            targetUsersEN.push(mention);

            return message.reply(`Added ${event.mentions[mention]} to the English target list.`);

        }

    }

    else if (command === "remove") {

        const language = args[1];

        const mention = Object.keys(event.mentions)[0];

        if (language !== 'bn' && language !== 'en') {

            return message.reply("Please specify a valid language: 'bn' or 'en'.");

        }

        if (!mention) {

            return message.reply("You must mention a user to remove.");

        }

        if (language === 'bn') {

            if (!targetUsersBN.includes(mention)) {

                return message.reply("This user is not in the Bangla list.");

            }

            targetUsersBN = targetUsersBN.filter(uid => uid !== mention);

            return message.reply(`Removed ${event.mentions[mention]} from the Bangla target list.`);

        } else if (language === 'en') {

            if (!targetUsersEN.includes(mention)) {

                return message.reply("This user is not in the English list.");

            }

            targetUsersEN = targetUsersEN.filter(uid => uid !== mention);

            return message.reply(`Removed ${event.mentions[mention]} from the English target list.`);

        }

    }

    else if (command === "list") {

        if (targetUsersBN.length === 0 && targetUsersEN.length === 0) {

            return message.reply("Bangla and English lists are both empty.");

        }

        try {

            let bnList = "Bangla List:\n";

            if (targetUsersBN.length > 0) {

                let bnUsersInfo = await api.getUserInfo(targetUsersBN);

                bnList += targetUsersBN.map(uid => `${bnUsersInfo[uid]?.name || 'Unknown'} (UID: ${uid})`).join("\n");

            } else {

                bnList += "No users in the Bangla list.\n";

            }

            let enList = "\nEnglish List:\n";

            if (targetUsersEN.length > 0) {

                let enUsersInfo = await api.getUserInfo(targetUsersEN);

                enList += targetUsersEN.map(uid => `${enUsersInfo[uid]?.name || 'Unknown'} (UID: ${uid})`).join("\n");

            } else {

                enList += "No users in the English list.";

            }

            return message.reply(bnList + enList);

        } catch (error) {

            console.error("Error fetching user info: ", error);

            return message.reply("An error occurred while fetching the user lists.");
        }
    }

    else if (command === "admin" && args[1] === 'add') {

        const mention = Object.keys(event.mentions)[0];

        if (!mention) {

            return message.reply("You must mention a user to add as an admin.");

        }

        if (adminList.includes(mention)) {

            return message.reply("This user is already an admin.");

        }

        adminList.push(mention);

        return message.reply(`Added ${event.mentions[mention]} as an admin.`);

    }

    else if (command === "admin" && args[1] === 'remove') {

        const mention = Object.keys(event.mentions)[0];

        if (!mention) {

            return message.reply("You must mention a user to remove from admin.");

        }

        if (!adminList.includes(mention)) {

            return message.reply("This user is not an admin.");

        }

        adminList = adminList.filter(uid => uid !== mention);

        return message.reply(`Removed ${event.mentions[mention]} from the admin list.`);

    }

    else if (command === "admin" && args[1] === 'list') {

        if (adminList.length === 0) {

            return message.reply("No admins in the list.");

        }

        try {

            let adminListMessage = "Admin List:\n";

            let adminUsersInfo = await api.getUserInfo(adminList);

            adminListMessage += adminList.map(uid => `${adminUsersInfo[uid]?.name || 'Unknown'} (UID: ${uid})`).join("\n");
            return message.reply(adminListMessage);} catch (error) {
            console.error("Error fetching admin user info: ", error);
            return message.reply("An error occurred while fetching the admin list.");

        }
    }
};
loadIgnoredUIDs();
