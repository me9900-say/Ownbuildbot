const config = require('../config');

module.exports = {
    fakevCard: {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
        },
        message: {
            contactMessage: {
                displayName: `${config.BOT_NAME || '𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪'} OFFICIAL`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${config.BOT_NAME || '𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪'}\nORG:ZAIDI-TEXK NETWORK;\nTEL;type=CELL;type=VOICE;waid=${(config.OWNER_NUMBER || '923315462969').replace(/[^0-9]/g, '')}:${config.OWNER_NUMBER || '+923315462969'}\nEND:VCARD`
            }
        }
    }
};
