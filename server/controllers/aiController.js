// controllers/aiController.js
const { askGemini } = require('../helpers/gemini');
class AIController {
  static async rekomendasiResep(req, res) {
    try {
      const { question } = req.body;
      if (!question) return res.status(400).json({ message: 'Pertanyaan tidak boleh kosong' });
      const aiResponse = await askGemini(question);
      res.json({ rekomendasi: aiResponse });
    } catch (err) {
      res.status(500).json({ message: 'Gagal mendapatkan rekomendasi', error: err.message });
    }
  }
}
module.exports = AIController;