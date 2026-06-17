const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const { Boom } = require('@hapi/boom');

// Exact small letters me require kiya hai taake Linux deployments me error na aaye
const zaidiHandler = require('./zaidi'); 

async function startBotConnection() {
    // Session management
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    console.log(`🚀 Starting Bot Instance using Baileys v${version.join('.')}`);

    const arslan = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['Arslan Bot Multi-Device', 'Safari', '1.0.0'],
        auth: state,
        version
    });

    // Save credentials on update
    arslan.ev.on('creds.update', saveCreds);

    // Connection updates handling
    arslan.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(`⚠️ Connection closed. Reason: ${reason}`);
            
            if (reason === DisconnectReason.badSession) { 
                console.log(`❌ Bad Session File, Please Delete auth folder and Scan Again.`); 
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed || reason === DisconnectReason.connectionLost || reason === DisconnectReason.connectionTimedOut || reason === DisconnectReason.restartRequired || reason === DisconnectReason.timedOut) { 
                console.log("🔄 Reconnecting connection loop..."); 
                startBotConnection(); 
            } else if (reason === DisconnectReason.loggedOut) { 
                console.log(`❌ Device Logged Out, Scan Again.`); 
                process.exit();
            } else { 
                console.log(`🔄 Unknown Disconnect Reason, Reconnecting...`);
                startBotConnection(); 
            }
        } else if (connection === 'open') {
            console.log(`✅ Bot Successfully Connected! Waiting for messages...`);
        }
    });

    /**
     * MESSAGES UPSERT LISTENER
     * Optimized event-loop separation using setImmediate for 50+ bots stability
     */
    arslan.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            if (!chatUpdate.messages) return;
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            
            // Ignore status broadcast logs to avoid high CPU usage
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return;

            // Fire and forget: process messages asynchronously
            setImmediate(async () => {
                await zaidiHandler(arslan, mek);
            });

        } catch (err) {
            console.error("❌ Error inside index messages handler loop:", err);
        }
    });
}

// Execution trigger (No useless returns)
startBotConnection();
