const mongoose = require('mongoose');

const pluginsSchema = new mongoose.Schema({
    botId: { type: String, required: true, index: true }, // Targeted connected bot number
    pluginName: { type: String, required: true },
    isEnabled: { type: Boolean, default: true },
    bannedGroups: { type: [String], default: [] }, // Specific chats where this plugin is disabled
    updatedAt: { type: Date, default: Date.now }
});

// Ensure a single bot has one unique configuration per plugin reference
pluginsSchema.index({ botId: 1, pluginName: 1 }, { unique: true });

const Plugins = mongoose.model('Plugins', pluginsSchema);

const isPluginAllowed = async (botId, pluginName, chatId) => {
    try {
        const record = await Plugins.findOne({ botId, pluginName });
        if (!record) return true; // Default behavior is enabled
        if (!record.isEnabled) return false;
        if (chatId && record.bannedGroups.includes(chatId)) return false;
        return true;
    } catch (e) {
        return true;
    }
};

module.exports = { Plugins, isPluginAllowed };
