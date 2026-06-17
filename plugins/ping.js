const { sleep } = require('../lib/functions');

module.exports = {
    name: 'ping',
    alias: ['speed', 'latency'],
    category: 'main',
    desc: 'Live ping speed monitor with edits protocol',
    async execute(conn, m, { args, prefix, command }) {
        try {
            // 1. Initial Start Reaction
            await conn.sendMessage(m.chat, {
                react: { text: "👑", key: m.key }
            });

            // 2. Initial Message Stream Injection
            const msg = await conn.sendMessage(m.chat, {
                text: "*TESTING....🤗*"
            }, { quoted: m });

            await sleep(1000);

            // 3. 🔁 Live Update Dynamic Loop (30 Seconds Session)
            for (let i = 0; i < 30; i++) {
                const start = Date.now();
                
                // Tiny delay simulating live check processing latency
                await sleep(50);
                const pingSpeed = Date.now() - start;

                // Edit the existing message using Baileys protocolMessage v14
                await conn.relayMessage(m.chat, {
                    protocolMessage: {
                        key: msg.key,
                        type: 14,
                        editedMessage: {
                            conversation: `*👑 SPEED :❯ ${pingSpeed} MS 👑*`
                        }
                    }
                }, {});

                await sleep(1000);
            }

            // 4. End Success Reaction
            await conn.sendMessage(m.chat, {
                react: { text: "😍", key: m.key }
            });

        } catch (e) {
            console.error("Panel Plugin Deployment Execution Error:", e);
            
            await conn.sendMessage(m.chat, {
                react: { text: "❌", key: m.key }
            });
            
            await conn.sendMessage(m.chat, { text: "*Ping processing failed — Internal stream break.*" });
        }
    }
};
