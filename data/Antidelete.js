const mongoose = require('mongoose');

const antideleteSchema = new mongoose.Schema({
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
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Antidelete = mongoose.model('Antidelete', antideleteSchema);

const getAntideleteStatus = async (chatId) => {
    try {
        if (!chatId) return false;
        const cleanId = chatId.trim();
        const data = await Antidelete.findOne({ chatId: cleanId });
        return data ? data.status : false;
    } catch (e) { 
        console.error("❌ Error getting Antidelete Status:", e.message);
        return false; 
    }
};

const setAntideleteStatus = async (chatId, status) => {
    try {
        if (!chatId) return false;
        const cleanId = chatId.trim();
        await Antidelete.findOneAndUpdate(
            { chatId: cleanId }, 
            { status, updatedAt: Date.now() }, 
            { upsert: true, new: true }
        );
        return true;
    } catch (e) { 
        console.error("❌ Error setting Antidelete Status:", e.message);
        return false; 
    }
};

module.exports = { Antidelete, getAntideleteStatus, setAntideleteStatus };
