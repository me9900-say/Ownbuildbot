/**
 * 𓆩𝐙𝐀𝐈𝐃𝐈-𝐌𝐃𓆪 - MASTER SYSTEM CORE ENGINE
 * Completely rebuilt for clean multi-bot pipeline distribution.
 * Free from hidden developer sudo links, telemetry, and force-channels.
 */

const config = require('../config');
const { sms } = require('./msg');
const { incrementStats, getUserConfigFromMongoDB } = require('./database');
const { getGroupAdmins } = require('./functions'); // Group Admins check karne ke liye helper
const { getAntilinkSettings } = require('../data/Antilink'); // Anti-Link settings data layer

/**
 * Main Message Interceptor and Router Pipeline Loop
 * @param {import('@whiskeysockets/baileys').WASocket} conn Baileys Connection Client instance.
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} m Raw incoming WebMessageInfo message state.
 * @param {any} store Baileys Memory Store cache layer instance.
 */
async function arslanmd(conn, m, store) {
    try {
        // 1. Initial Empty Validation Check
        if (!m || !m.message) return;

        // 2. Format Raw Message using msg.js wrapper utility
        m = sms(conn, m);
        if (!m) return;

        const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const senderNumber = m.sender.split('@')[0];

        // 3. Dynamic User Configuration Syncing
        const userConfig = await getUserConfigFromMongoDB(botId.split('@')[0]) || {};

        // ==========================================================
        // 🛡️ ANTI-LINK INTERCEPTOR ENGINE (CRITICAL SECURITY BLOCK)
        // ==========================================================
        if (m.isGroup && m.text) {
            // Check if text contains any WhatsApp Group invite link pattern
            const hasGroupLink = m.text.includes('chat.whatsapp.com') || m.text.includes('wa.me/setting');
            
            if (hasGroupLink) {
                // Fetch group active settings from data/Antilink.js
                const antilink = await getAntilinkSettings(m.chat);
                
                if (antilink.status) {
                    // Fetch group metadata and check if sender is admin or owner
                    const groupMetadata = await conn.groupMetadata(m.chat);
                    const admins = getGroupAdmins(groupMetadata.participants);
                    const globalOwnerClean = (config.OWNER_NUMBER || '923237045919').replace(/[^0-9]/g, '');
                    const isSenderAdmin = admins.includes(m.sender) || senderNumber === globalOwnerClean || m.fromMe;

                    // If sender is a regular member (Not Admin), trigger action
                    if (!isSenderAdmin) {
                        console.log(`[ANTI-LINK TRIGGERED] 🚨 Link detected from: ${m.sender}`);
                        
                        // Action 1: Delete the malicious message link
                        await conn.sendMessage(m.chat, { delete: m.key });

                        // Action 2: Kick user if group policy is set to 'kick'
                        if (antilink.action === 'kick') {
                            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                            await conn.sendMessage(m.chat, { 
                                text: `*🚨 ANTI-LINK SEVERE ACTION:* @${senderNumber} has been removed for sharing group links!`,
                                mentions: [m.sender]
                            });
                        } else {
                            // Default Warning/Delete text notification
                            await conn.sendMessage(m.chat, { 
                                text: `*⚠️ LINK DETECTED:* @${senderNumber}, Group links are strictly prohibited here! Your message has been removed.`,
                                mentions: [m.sender]
                            });
                        }
                        return; // Stop further command loops processing for this specific message
                    }
                }
            }
        }

        // 4. AUTOMATED FEATURES CONTROLLER PIPELINE (Syncing with config.js & MongoDB)
        
        // A. Handle Status Auto View / Like Sync
        if (m.chat === 'status@broadcast') {
            const isAutoView = userConfig.AUTO_VIEW_STATUS || config.AUTO_VIEW_STATUS || 'true';
            if (isAutoView === 'true') {
                await conn.readMessages([m.key]);
                console.log(`[STATUS VIEWED] 👁️ Status viewed from: ${m.sender}`);
            }

            const isAutoLike = userConfig.AUTO_LIKE_STATUS || config.AUTO_LIKE_STATUS || 'true';
            if (isAutoLike === 'true' && m.key.id) {
                const statusEmoji = userConfig.AUTO_STATUS_MSG || config.AUTO_STATUS_MSG || '🤗';
                await conn.sendMessage(m.chat, {
                    react: { text: statusEmoji, key: m.key }
                }, { statusJidList: [m.key.participant] });
            }
            return; // Skip command routers parsing if message is a status element
        }

        // B. Handle Auto Typing Indicator Simulation
        const isAutoTyping = userConfig.AUTO_TYPING || config.AUTO_TYPING || 'false';
        if (isAutoTyping === 'true' && m.chat) {
            await conn.sendPresenceUpdate('composing', m.chat);
        }

        // C. Handle Auto Recording Audio Presence Simulation
        const isAutoRecording = userConfig.AUTO_RECORDING || config.AUTO_RECORDING || 'false';
        if (isAutoRecording === 'true' && m.chat) {
            await conn.sendPresenceUpdate('recording', m.chat);
        }

        // D. Auto Read Incoming Messages
        const isAutoRead = userConfig.READ_MESSAGE || config.READ_MESSAGE || 'false';
        if (isAutoRead === 'true' && m.chat) {
            await conn.readMessages([m.key]);
        }

        // 5. SECURITY BLOCK: Sudo/Owner Bypass Validation Checks
        const globalOwnerClean = (config.OWNER_NUMBER || '923237045919').replace(/[^0-9]/g, '');
        const isOwner = senderNumber === globalOwnerClean || m.fromMe;

        // 6. WORK TYPE PERMISSION FILTERS LAYER (Public, Private, Group, Inbox)
        const currentWorkType = (config.WORK_TYPE || 'public').toLowerCase();
        
        if (!isOwner) {
            if (currentWorkType === 'private' && m.isGroup) return;
            if (currentWorkType === 'group' && !m.isGroup) return;
            if (currentWorkType === 'inbox' && m.isGroup) return; 
        }

        // 7. ANALYTICS LOGS DATA INCREMENTATION INTERCEPTOR
        if (m.text && m.text.startsWith(config.PREFIX || '.')) {
            await incrementStats(botId.split('@')[0], 'commandsUsed');
        } else {
            await incrementStats(botId.split('@')[0], 'messagesReceived');
        }

        // ==========================================================
        // FUTURE PLUGINS DISPATCH HOOK (For Plugin System Execution)
        // ==========================================================
        
    } catch (error) {
        console.error("❌ System Core Engine Framework Error:", error.message);
    }
}

// Anti-Call Interceptor Manager Block (Directly used inside main.js call event)
async function handleCallRejection(conn, callEvent) {
    try {
        if (!callEvent || !callEvent[0]) return;
        const call = callEvent[0];
        
        if (call.status === 'offer') {
            const botId = conn.user.id.split(':')[0];
            const userConfig = await getUserConfigFromMongoDB(botId) || {};
            
            const isAntiCallEnabled = userConfig.ANTI_CALL || config.ANTI_CALL || 'false';
            if (isAntiCallEnabled === 'true') {
                await conn.rejectCall(call.id, call.from);
                
                const rejectionNotice = userConfig.REJECT_MSG || config.REJECT_MSG || '*CALL LATER PLEASE ☺️🌹*';
                await conn.sendMessage(call.from, { text: rejectionNotice });
                console.log(`[CALL REJECTED] 🚫 Call blocked from user JID: ${call.from}`);
            }
        }
    } catch (e) {
        console.error("❌ Anti-Call Engine Processing Interceptor Error:", e.message);
    }
}

module.exports = {
    arslanmd,
    handleCallRejection
};
