const config = require('../config');
const { getUserConfigFromMongoDB } = require('./database');

/**
 * Handle and intercept deleted/revoked WhatsApp messages seamlessly
 */
const handleAntidelete = async (conn, updates, store) => {
    try {
        for (const update of updates) {
            // Own deleted messages are skipped from monitoring logs
            if (update.key.fromMe) continue;

            // Accurate Baileys status protocol extraction check for protocol type actions
            const isRevoke = update.update.messageStubType === 68 || 
                             (update.update.message && 
                              update.update.message.protocolMessage && 
                              update.update.message.protocolMessage.type === 0);

            if (isRevoke) {
                const chatId = update.key.remoteJid;
                const messageId = update.key.id;
                const participant = update.key.participant || chatId;

                // Syncing directly with database settings mapping wrapper override
                const userConfig = await getUserConfigFromMongoDB(conn.user.id.split(':')[0]) || {};
                
                // Read from global config fallback state safely if specific trigger array is missing
                const isEnabled = userConfig.ANTIDELETE_ENABLE || 'true'; 
                if (isEnabled !== 'true') return;

                // Validating cacheable message store memory stack buffers tracking status
                if (!store || !store.messages || !store.messages[chatId]) return;
                
                // Fetch cached object payload array map reference parameters
                const msgList = store.messages[chatId];
                const msg = msgList.find(m => m.key && m.key.id === messageId);

                if (msg) {
                    const alertText = `\n🚫 *ANTI-DELETE DETECTED* 🚫\n\n👤 *User:* @${participant.split('@')[0]}\n📅 *Date:* ${new Date().toLocaleString()}\n\n> ${config.BOT_FOOTER || '© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʑɑ͢ı֟፝𝛛֟ı֟፝-ϻ֟͡𝛛'}\n`;
                    
                    // Sending structural string alert alerts logs notification targets
                    await conn.sendMessage(chatId, { text: alertText, mentions: [participant] });
                    
                    // Forwarding actual extracted payload elements cleanly
                    await conn.sendMessage(chatId, { forward: msg, contextInfo: { isForwarded: false } }, { quoted: msg });
                }
            }
        }
    } catch (e) { 
        console.error("❌ Antidelete Core Interceptor Error:", e.message); 
    }
};

module.exports = { handleAntidelete };
