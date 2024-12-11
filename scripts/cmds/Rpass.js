module.exports.config = {
    name: "rpass",
    version: "1.0.0",
    role: 0,
    author: "SiamTheFrog",
    description: "Generate a random password",
    guide: "[rpass] - Generates a random password",
    category: "utility",
    coolDowns: 5,
};

function generateRandomPassword(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    return password;
}

module.exports.onStart = async function ({ api, event }) {
    const passwordLength = 12; 
    const randomPassword = generateRandomPassword(passwordLength);
    return api.sendMessage(randomPassword, event.threadID, event.messageID);
};
