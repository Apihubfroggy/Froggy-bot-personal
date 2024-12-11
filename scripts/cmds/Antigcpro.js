const adminIDs = ['100004194914980', 'YOUR_ADMIN_ID_2'];//replace and add yr uid 
const monitoredThreads = {
    "9209523812456470": true,
    "6836562133049936": true,//add your gc id
};

module.exports = {
    config: {
        name: "antigcpro",
        version: "1.0",
        role: 0,
        author: "SiamTheFrog",
        shortDescription: "If someone changes the group name or picture, he will be removed from that group",
        longDescription: "Automatically remove members who try to change the group profile picture or group name unless they are admins.",
        category: "tools",
        guide: "{pn}"
    },

    onStart: async function({ api, event, message }) {
        Object.keys(monitoredThreads).forEach(threadID => {
            monitoredThreads[threadID] = true;
        });
        message.reply("Protection is already activated.");
    },

    onEvent: async function ({ api, event }) {
        const { threadID, author, logMessageType } = event;

        if (!monitoredThreads[threadID]) return;

        if (logMessageType === "log:thread-image" || logMessageType === "log:thread-name") {
            const threadInfo = await api.getThreadInfo(threadID);
            const isAdmin = threadInfo.adminIDs.some(admin => admin.id === author);

            if (isAdmin) return;

            const userName = await api.getUserInfo(author).then(res => res[author]?.name);

            await api.sendMessage(`khankir pola @${userName}`, threadID);
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            await api.sendMessage(`Randi ki aulat @${userName}`, threadID);
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            await api.sendMessage(`Kalo mukhey machikney @${userName}`, threadID);
            await new Promise(resolve => setTimeout(resolve, 2000)); 

            await api.removeUserFromGroup(author, threadID);
        }
    },

    commands: {
        "antigcpro add": async function({ api, event, message }) {
            const threadID = event.threadID;

            if (!monitoredThreads[threadID]) {
                monitoredThreads[threadID] = true;
                await message.reply("Protection is now activated for this group.");
            } else {
                await message.reply("This group is already protected.");
            }
        }
    }
};
