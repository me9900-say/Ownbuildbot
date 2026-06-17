const axios = require('axios');
const { downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys');

/**
 * Super Fast External Media Buffer Fetcher
 */
const getBuffer = async (url, options) => {
	try {
		options = options ? options : {};
		var res = await axios({
			method: 'get',
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		});
		return res.data;
	} catch (e) {
		console.log("Error inside getBuffer utility:", e.message);
		return null;
	}
};

/**
 * Extract WhatsApp Group Administrators Array List
 */
const getGroupAdmins = (participants) => {
	var admins = [];
	for (let i of participants) {
		if (i.admin !== null) {
			admins.push(i.id);
		}
	}
	return admins;
};

/**
 * Generate Secure Semi-Random Numeric Extensions File Names
 */
const getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)}${ext}`;
};

/**
 * Format Digits Utility to Text Extensions (e.g., 1000 -> 1.0K)
 */
const h2k = (eco) => {
	var lyrik = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
	var ma = Math.log10(Math.abs(eco)) / 3 | 0;
	if (ma == 0) return eco;
	var ppo = lyrik[ma];
	var scale = Math.pow(10, ma * 3);
	var scaled = eco / scale;
	var formatt = scaled.toFixed(1);
	if (/\\.0$/.test(formatt))
		formatt = formatt.substr(0, formatt.length - 2);
	return formatt + ppo;
};

/**
 * Universal Regular Expression URL Validator Checker
 */
const isUrl = (url) => {
	return url.match(
		new RegExp(
			/https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%+_.~#?&/=]*)/,
			'gi'
		)
	);
};

/**
 * JSON Formatting Alignment Wrapper Utility
 */
const Json = (string) => {
    return JSON.stringify(string, null, 2);
};

/**
 * Format Server Runtime System Milliseconds to Human Readable String
 */
const runtime = (seconds) => {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : '';
	var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
	var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
	var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
	return dDisplay + hDisplay + mDisplay + sDisplay;
};

/**
 * Dynamic JID Decoder & User WhatsApp ID Parser
 * Safely normalizes nested bot/sender strings
 */
const decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
    }
    return jid;
};

/**
 * Low-Level Media Message Stream Downloader (RAM Optimized)
 */
const downloadMediaMessage = async (message, mediaType) => {
    try {
        let mType = mediaType + 'Message';
        if (!message[mType]) return null;

        const stream = await downloadContentFromMessage(message[mType], mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (e) {
        console.error("Error streaming media inside functions.js:", e.message);
        return null;
    }
};

// Exporting all core tools safely
module.exports = {
	getBuffer,
	getGroupAdmins,
	getRandom,
	h2k,
	isUrl,
	Json,
	runtime,
	decodeJid,
	downloadMediaMessage
};
