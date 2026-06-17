const mongoose = require('mongoose');

const filtersSchema = new mongoose.Schema({
    chatId: { type: String, required: true, index: true },
    triggerWord: { type: String, required: true },
    responseMsg: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
});

filtersSchema.index({ chatId: 1, triggerWord: 1 }, { unique: true });

const Filters = mongoose.model('Filters', filtersSchema);

const getActiveFilters = async (chatId) => {
    try {
        return await Filters.find({ chatId });
    } catch (e) {
        return [];
    }
};

module.exports = { Filters, getActiveFilters };
