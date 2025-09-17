const axios = require('axios');

// Ganti dengan API Key Gemini Anda
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

async function askGemini(question) {
	try {
		const response = await axios.post(
			`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
			{
				contents: [
					{ parts: [{ text: question }] }
				]
			},
			{
				headers: { 'Content-Type': 'application/json' }
			}
		);
		// Ambil hasil dari response Gemini
		const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada rekomendasi.';
		return result;
	} catch (err) {
		throw new Error(err.response?.data?.error?.message || err.message);
	}
}

module.exports = { askGemini };
