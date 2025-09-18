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
				],
				generationConfig: {
					temperature: 0.7,
					maxOutputTokens: 256
				}
			},
			{
				headers: { 'Content-Type': 'application/json' }
			}
		);
		const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada rekomendasi.';
		return result;
	} catch (err) {
		console.error('Gemini API error:', err.response?.data || err.message);
		throw new Error(err.response?.data?.error?.message || err.message);
	}
}

module.exports = { askGemini };
