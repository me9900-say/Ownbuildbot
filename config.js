const fs = require('fs');
const dotenv = require('dotenv');

// Check and load configuration environments from .env file if available
if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' });
}

module.exports = {
    // ===========================================================
    // 1. CONFIGURATION DE BASE (Session & Database)
    // ===========================================================
    SESSION_ID: process.env.SESSION_ID || "MINI BOT", 
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://offarslan_db_user:arslanmd@cluster0.xrqkzwg.mongodb.net/?appName=Cluster0',
    
    // ===========================================================
    // 2. INFORMATIONS DU BOT
    // ===========================================================
    PREFIX: process.env.PREFIX || '.',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '+923237045919', // Aapka number
    BOT_NAME: "𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪",
    OWNER_NAME: "ZAIDI-TEXK",
    BOT_FOOTER: '© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʑɑ͢ı֟፝𝛛֟ı֟፝-ϻ֟͡𝛛',
    
    // Mode de travail : public, private, group, inbox
    WORK_TYPE: process.env.WORK_TYPE || "public", 
    
    // ===========================================================
    // 3. FONCTIONNALITÉS AUTOMATIQUES (STATUTS)
    // ===========================================================
    AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || 'true', // View WhatsApp statuses automatically
    AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || 'true', // Like statuses automatically
    AUTO_LIKE_EMOJI: ['❤️', '🌹', '✨', '🥰', '🌹', '😍', '💞', '💕', '☺️', '🤗'], 
    
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || 'false', // Reply to statuses dynamically
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || '🤗', // Target automated response string
    
    // ===========================================================
    // 4. FONCTIONNALITÉS DE CHAT & PRÉSENCE
    // ===========================================================
    READ_MESSAGE: process.env.READ_MESSAGE || 'false', // Read messages buffer (Blue Tick activation)
    AUTO_TYPING: process.env.AUTO_TYPING || 'false', // Simulates continuous typing status indicator
    AUTO_RECORDING: process.env.AUTO_RECORDING || 'false', // Simulates recording status overheads
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || 'true', // Makes the server always active online
    
    // ===========================================================
    // 5. GESTION DES GROUPES
    // ===========================================================
    WELCOME_ENABLE: process.env.WELCOME_ENABLE || 'true',
    GOODBYE_ENABLE: process.env.GOODBYE_ENABLE || 'true',
    WELCOME_MSG: process.env.WELCOME_MSG || null, 
    GOODBYE_MSG: process.env.GOODBYE_MSG || null, 
    WELCOME_IMAGE: process.env.WELCOME_IMAGE || null, 
    GOODBYE_IMAGE: process.env.GOODBYE_IMAGE || null,
    
    GROUP_INVITE_LINK: process.env.GROUP_INVITE_LINK || 'https://chat.whatsapp.com/B9aQvczskhr7gekKrAjCsm?s=cl&p=a&mlu=0&amv=1',
    
    // ===========================================================
    // 6. SÉCURITÉ & ANTI-CALL & NEWSLETTER MANAGEMENT
    // ===========================================================
    ANTI_CALL: process.env.ANTI_CALL || 'false', // Auto reject direct incoming stream lines
    REJECT_MSG: process.env.REJECT_MSG || '*CALL LATER PLEASE ☺️🌹*',
    NEWSLETTER_ID: '120363423196146172@newsletter',
    NEWSLETTER_NAME: '𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪',
    
    // ===========================================================
    // 7. IMAGES & LIENS
    // ===========================================================
    IMAGE_PATH: 'https://files.catbox.moe/himp43.jpg',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBhyp7BfxoEclHqI33Y',
    
    // ===========================================================
    // 8. EXTERNAL API (Optionnel)
    // ===========================================================
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '7214172448:AAHGqSgaw-zGVPZWvl8msDOVDhln-9kExas',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '+923197517042'
};
