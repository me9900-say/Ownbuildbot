const fs = require('fs');
const path = require('path');

// Memory optimization allocation tracking
global.plugins = global.plugins || {};

/**
 * Dynamic Plugin Loader
 * Reads scripts from 'plugin/' directory and flushes require cache to save RAM
 */
const loadDynamicPlugins = () => {
    const pluginDirectory = path.join(__dirname, 'plugin');[span_2](start_span)[span_2](end_span)
    
    if (!fs.existsSync(pluginDirectory)) {
        fs.mkdirSync(pluginDirectory);
    }

    const files = fs.readdirSync(pluginDirectory);
    let loadedCount = 0;

    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                const filePath = path.join(pluginDirectory, file);
                
                // Professional RAM management: clear module cache to prevent multi-bot memory leaks
                delete require.cache[require.resolve(filePath)];
                const extractedModule = require(filePath);
                
                if (extractedModule.cmdName) {
                    global.plugins[extractedModule.cmdName] = extractedModule;
                    loadedCount++;
                }
            } catch (err) {
                console.log(`⚠️ Error reading plugin file [${file}]:`, err.message);
            }
        }
    }
    console.log(`📊 Core Engine: Successfully initialized ${loadedCount} dynamic plugins.`);
};

// Start parsing plugins instantly on startup
loadDynamicPlugins();

/**
 * Main Message Router Export
 */
module.exports = async (arslan, mek) => {
    try {
        const from = mek.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        // Extract plain string body payload safely
        const body = mek.message?.conversation || 
                     mek.message?.extendedTextMessage?.text || 
                     mek.message?.imageMessage?.caption || 
                     mek.message?.videoMessage?.caption || '';

        // Standard regex prefix checking support
        const prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi)[0] : '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // -------------------------------------------------------------------------
        // BACKGROUND OPERATIONS / LISTENERS (e.g. Antidelete, Anticall, Autobio)
        // -------------------------------------------------------------------------
        const backgroundTasks = [];
        for (const key in global.plugins) {
            const currentPlugin = global.plugins[key];
            if (currentPlugin.alwaysExecute) {
                backgroundTasks.push(currentPlugin.alwaysExecute(arslan, mek, { from, isGroup, body, text, prefix }));
            }
        }
        if (backgroundTasks.length > 0) {
            await Promise.all(backgroundTasks).catch(err => console.log("Background loop logic error:", err));
        }

        // Exit early if the input message is not an active command trigger
        if (!isCmd) return;

        // -------------------------------------------------------------------------
        // COMMAND EXECUTION ROUTING
        // -------------------------------------------------------------------------
        const executionPlugin = global.plugins[command];
        
        if (executionPlugin) {
            // Group restrictions check guard
            if (executionPlugin.isGroupOnly && !isGroup) {
                return arslan.sendMessage(from, { text: '❌ *This command is restricted to groups only!*' }, { quoted: mek });
            }

            // Execute the isolated command file async
            await executionPlugin.execute(arslan, mek, { from, isGroup, args, text, prefix });
        }

    } catch (coreError) {
        console.error("❌ Critical exception inside core handler engine:", coreError);
    }
};
