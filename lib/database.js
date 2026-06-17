const mongoose = require('mongoose');
const config = require('../config');

const connectdb = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(config.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ Database Connected Successfully");
    } catch (e) {
        console.error("❌ Database Connection Failed:", e.message);
    }
};

// ====================================
// MODÈLES / SCHEMAS (Zaidi Multi-Bot Standard)
// ====================================

const sessionSchema = new mongoose.Schema({
    number: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    credentials: {
        type: Object,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const userConfigSchema = new mongoose.Schema({
    number: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    config: {
        AUTO_RECORDING: { type: String, default: 'false' },
        AUTO_TYPING: { type: String, default: 'false' },
        ANTI_CALL: { type: String, default: 'false' },
        REJECT_MSG: { type: String, default: '*CALL LATER PLEASE ☺️🌹*' },
        AUTO_VIEW_STATUS: { type: String, default: 'true' },
        AUTO_LIKE_STATUS: { type: String, default: 'true' },
        AUTO_STATUS_REPLY: { type: String, default: 'false' },
        AUTO_STATUS_MSG: { type: String, default: '🤗' },
        READ_MESSAGE: { type: String, default: 'false' },
        WELCOME_ENABLE: { type: String, default: 'true' },
        GOODBYE_ENABLE: { type: String, default: 'true' }
    },
    updatedAt: { type: Date, default: Date.now }
});

const otpSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true, index: true },
    otp: { type: String, required: true },
    pendingConfig: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // 5 minutes expiration
});

const activeNumberSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true, index: true },
    addedAt: { type: Date, default: Date.now }
});

const statsSchema = new mongoose.Schema({
    number: { type: String, required: true, index: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    commandsUsed: { type: Number, default: 0 },
    messagesReceived: { type: Number, default: 0 },
    groupsInteracted: { type: Number, default: 0 }
});

// Compound unique index for daily stats per number
statsSchema.index({ number: 1, date: 1 }, { unique: true });

const Session = mongoose.model('Session', sessionSchema);
const UserConfig = mongoose.model('UserConfig', userConfigSchema);
const OTP = mongoose.model('OTP', otpSchema);
const ActiveNumber = mongoose.model('ActiveNumber', activeNumberSchema);
const Stats = mongoose.model('Stats', statsSchema);

// ====================================
// FONCTIONS CORE DATABASE
// ====================================

// --- Session Management ---
async function saveSessionToMongoDB(number, credentials) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await Session.findOneAndUpdate(
            { number: cleanNumber },
            { credentials, updatedAt: Date.now() },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('❌ Error saving session to MongoDB:', error);
    }
}

async function getSessionFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const session = await Session.findOne({ number: cleanNumber });
        return session ? session.credentials : null;
    } catch (error) {
        console.error('❌ Error getting session from MongoDB:', error);
        return null;
    }
}

async function deleteSessionFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await Session.deleteOne({ number: cleanNumber });
    } catch (error) {
        console.error('❌ Error deleting session from MongoDB:', error);
    }
}

// --- Dynamic Configuration Sync Management ---
async function getUserConfigFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const userConfig = await UserConfig.findOne({ number: cleanNumber });
        
        // Dynamic Allocation Fallback Mapping logic matching main.js requirement
        if (!userConfig) {
            return {
                AUTO_RECORDING: config.AUTO_RECORDING || 'false',
                AUTO_TYPING: config.AUTO_TYPING || 'false',
                ANTI_CALL: config.ANTI_CALL || 'false',
                REJECT_MSG: config.REJECT_MSG || '*CALL LATER PLEASE ☺️🌹*',
                AUTO_VIEW_STATUS: config.AUTO_VIEW_STATUS || 'true',
                AUTO_LIKE_STATUS: config.AUTO_LIKE_STATUS || 'true',
                AUTO_STATUS_REPLY: config.AUTO_STATUS_REPLY || 'false',
                AUTO_STATUS_MSG: config.AUTO_STATUS_MSG || '🤗',
                READ_MESSAGE: config.READ_MESSAGE || 'false',
                WELCOME_ENABLE: config.WELCOME_ENABLE || 'true',
                GOODBYE_ENABLE: config.GOODBYE_ENABLE || 'true'
            };
        }
        return userConfig.config;
    } catch (error) {
        console.error('❌ Error getting user config:', error);
        return config; // Safe structure fallback override
    }
}

async function updateUserConfigInMongoDB(number, newConfig) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const currentConfigData = await getUserConfigFromMongoDB(cleanNumber);
        
        // Merging old states cleanly with incoming payloads
        const mergedConfig = { ...currentConfigData, ...newConfig };

        await UserConfig.findOneAndUpdate(
            { number: cleanNumber },
            { config: mergedConfig, updatedAt: Date.now() },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('❌ Error updating user config:', error);
    }
}

// --- OTP Handlers ---
async function saveOTPToMongoDB(number, otp, pendingConfig) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await OTP.findOneAndUpdate(
            { number: cleanNumber },
            { otp, pendingConfig, createdAt: Date.now() },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('❌ Error saving OTP:', error);
    }
}

async function verifyOTPFromMongoDB(number, inputOtp) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const record = await OTP.findOne({ number: cleanNumber });
        if (!record) return { valid: false, error: 'OTP expired or not found' };
        if (record.otp !== inputOtp) return { valid: false, error: 'Invalid OTP code' };

        const configToApply = record.pendingConfig;
        await OTP.deleteOne({ number: cleanNumber }); // Burn OTP after verification
        return { valid: true, config: configToApply };
    } catch (error) {
        console.error('❌ Error verifying OTP:', error);
        return { valid: false, error: 'Database verification failure' };
    }
}

// --- Multi-Bot Active Connection List ---
async function addNumberToMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await ActiveNumber.findOneAndUpdate(
            { number: cleanNumber },
            { addedAt: Date.now() },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('❌ Error adding active number:', error);
    }
}

async function removeNumberFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await ActiveNumber.deleteOne({ number: cleanNumber });
    } catch (error) {
        console.error('❌ Error removing active number:', error);
    }
}

async function getAllNumbersFromMongoDB() {
    try {
        const records = await ActiveNumber.find({});
        return records.map(r => r.number);
    } catch (error) {
        console.error('❌ Error getting all active numbers:', error);
        return [];
    }
}

// --- Stats Analytics Processors ---
async function incrementStats(number, field) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const today = new Date().toISOString().split('T')[0];
        await Stats.findOneAndUpdate(
            { number: cleanNumber, date: today },
            { $inc: { [field]: 1 } },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('❌ Error updating stats:', error);
    }
}

async function getStatsForNumber(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const stats = await Stats.find({ number: cleanNumber })
            .sort({ date: -1 })
            .limit(30);
        return stats;
    } catch (error) {
        console.error('❌ Error getting stats:', error);
        return [];
    }
}

// =================================
// EXPORTS 
// =================================

module.exports = {
    connectdb,

    Session,
    UserConfig,
    OTP,
    ActiveNumber,
    Stats,
    
    saveSessionToMongoDB,
    getSessionFromMongoDB,
    deleteSessionFromMongoDB,
    
    getUserConfigFromMongoDB,
    updateUserConfigInMongoDB,
    
    saveOTPToMongoDB,
    verifyOTPFromMongoDB,
    
    addNumberToMongoDB,
    removeNumberFromMongoDB,
    getAllNumbersFromMongoDB,
    
    incrementStats,
    getStatsForNumber,
    
    // Legacy Compatibility Wrappers
    getUserConfig: async (number) => {
        const configData = await getUserConfigFromMongoDB(number);
        return configData || {};
    },
    updateConfig: async (number, newConfig) => {
        return await updateUserConfigInMongoDB(number, newConfig);
    }
};
