const config = require('../config');

/**
 * Handle automated group notifications smoothly when users join or leave chats
 * @param {import('@whiskeysockets/baileys').WASocket} conn Baileys Connection Client instance.
 * @param {import('@whiskeysockets/baileys').GroupParticipantsUpdate} update Update parameter objects layout context.
 */
async function groupEvents(conn, update) {
    // Reading operational parameters switches directly from your master config module layer
    const isWelcomeEnabled = config.WELCOME_ENABLE === 'true'; 
    const isGoodbyeEnabled = config.GOODBYE_ENABLE === 'true'; 
    
    if (!isWelcomeEnabled && !isGoodbyeEnabled) return;

    try {
        const metadata = await conn.groupMetadata(update.id);
        const groupName = metadata.subject;
        const groupJid = update.id;
        const participants = update.participants;

        for (const participantJid of participants) {
            const username = `@${participantJid.split('@')[0]}`;
            
            // 1. WELCOME MESSAGE AUTOMATED MANAGEMENT LOGIC (Action: ADD)
            if (update.action === 'add' && isWelcomeEnabled) {
                
                const defaultWelcomeMsg = 
`*╭─「 WELCOME TO THE CREW 」─◇*
*│*
*│* *🌟 ɴᴇᴡ ᴍᴇᴍʙᴇʀ ᴀʀʀɪᴠᴇᴅ!*
*│* *👋 ʜᴇʟʟᴏ:* ${username}
*│* *🏰 ɢʀᴏᴜᴘ:* ${groupName}
*│* *📝 ɴᴏᴛᴇ:* Read group rules carefully!
*│*
*╰────────────────────○*
> ${config.BOT_FOOTER || '© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʑɑ͢ı֟፝𝛛֟ı֟፝-ϻ֟͡𝛛'}`;
                
                const welcomeText = config.WELCOME_MSG || defaultWelcomeMsg;

                const message = welcomeText
                    .replace(/@user/g, username)
                    .replace(/@group/g, groupName);
                
                // Dispatching graphic parameters elements layout if configurations exist
                if (config.WELCOME_IMAGE && config.WELCOME_IMAGE.length > 5) {
                    await conn.sendMessage(groupJid, {
                        image: { url: config.WELCOME_IMAGE },
                        caption: message,
                        mentions: [participantJid]
                    });
                } else {
                    await conn.sendMessage(groupJid, { text: message, mentions: [participantJid] });
                }
            }
            
            // 2. GOODBYE MESSAGE AUTOMATED MANAGEMENT LOGIC (Action: REMOVE)
            else if (update.action === 'remove' && isGoodbyeEnabled) {
                
                const defaultGoodbyeMsg = 
`*╭─「 FAREWELL LEGEND 」─◇*
*│*
*│* *😔 ᴍᴇᴍʙᴇʀ ʟᴇғᴛ ᴛʜᴇ ᴄʜᴀᴛ...*
*│* *👤 ʙʏᴇ ʙʏᴇ:* ${username}
*│* *📢 ᴍsɢ:* We hope to see you again soon!
*│*
*╰────────────────────○*
> ${config.BOT_FOOTER || '© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʑɑ͢ı֟፝𝛛֟ı֟፝-ϻ֟͡𝛛'}`;
                
                const goodbyeText = config.GOODBYE_MSG || defaultGoodbyeMsg;

                const message = goodbyeText
                    .replace(/@user/g, username)
                    .replace(/@group/g, groupName);
                
                // Dispatching goodbye graphic streams arrays elements safely
                if (config.GOODBYE_IMAGE && config.GOODBYE_IMAGE.length > 5) {
                    await conn.sendMessage(groupJid, {
                        image: { url: config.GOODBYE_IMAGE },
                        caption: message,
                        mentions: [participantJid]
                    });
                } else {
                    await conn.sendMessage(groupJid, { text: message, mentions: [participantJid] });
                }
            }
        }
    } catch (e) {
        console.error("❌ Group Events Notifications Processing Error:", e.message);
    }
}

module.exports = { groupEvents };
