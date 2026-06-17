const mongoose = require('mongoose');

const sudosSchema = new mongoose.Schema({
    botId: { type: String, required: true, unique: true, index: true },
    sudoNumbers: { type: [String], default: [] }, // Extra controllers permitted
    createdAt: { type: Date, default: Date.now }
});

const Sudos = mongoose.model('Sudos', sudosSchema);

const getSudos = async (botId) => {
    try {
        const record = await Sudos.findOne({ botId });
        return record ? record.sudoNumbers : [];
    } catch (e) {
        return [];
    }
};

const addSudo = async (botId, targetNumber) => {
    try {
        const cleanNumber = targetNumber.replace(/[^0-9]/g, '');
        await Sudos.findOneAndUpdate(
            { botId },
            { $addToSet: { sudoNumbers: cleanNumber } },
            { upsert: true, new: true }
        );
        return true;
    } catch (e) {
        return false;
    }
};

module.exports = { Sudos, getSudos, addSudo };
