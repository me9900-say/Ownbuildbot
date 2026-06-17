const mongoose = require('mongoose');

const antilinkSchema = new mongoose.Schema({
    chatId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    status: { 
        type: Boolean, 
        default: false 
    },
    action: { 
        type: String, 
        default: 'delete' // Options: 'delete' (sirf msg delete), 'kick' (user ko nikalna), 'warn'
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Antilink = mongoose.model('Antilink', antilinkSchema);

/**
 * Get current Anti-Link settings for a group chat
 */
const getAntilinkSettings = async (chatId) => {
    try {
        if (!chatId) return { status: false, action: 'delete' };
        const cleanId = chatId.trim();
        const data = await Antilink.findOne({ chatId: cleanId });
        return data ? { status: data.status, action: data.action } : { status: false, action: 'delete' };
    } catch (e) { 
        console.error("❌ Error getting Antilink Settings:", e.message);
        return { status: false, action: 'delete' }; 
    }
};

/**
 * Update or Save Anti-Link settings for a group chat
 */
const setAntilinkSettings = async (chatId, status, action = 'delete') => {
    try {
        if (!chatId) return false;
        const cleanId = chatId.trim();
        await Antilink.findOneAndUpdate(
            { chatId: cleanId }, 
            { status, action, updatedAt: Date.now() }, 
            { upsert: true, new: true }
        );
        return true;
    } catch (e) { 
        console.error("❌ Error setting Antilink Settings:", e.message);
        return false; 
    }
};

module.exports = { Antilink, getAntilinkSettings, setAntilinkSettings };
