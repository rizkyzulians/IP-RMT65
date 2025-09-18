// controllers/aiController.js
const { askGemini } = require('../helpers/gemini');
class AIController {
  static async rekomendasiResep(req, res) {
    try {
      const { question, recipes } = req.body;
      if (!question) return res.status(400).json({ message: 'Pertanyaan tidak boleh kosong' });
      if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
        return res.status(400).json({ message: 'Daftar resep harus dikirim dan tidak boleh kosong' });
      }
      // Buat prompt dengan konteks judul dan ingredients
      const recipeListText = recipes.map((r, idx) => {
        let line = `${idx + 1}. ${r.title}`;
        if (r.ingredients) line += ` (ingredients: ${r.ingredients})`;
        return line;
      }).join('\n');
      const prompt = `Berikut adalah daftar resep yang tersedia:\n${recipeListText}\n\n${question}\n\nJawaban/rekomendasi HANYA boleh berdasarkan daftar resep di atas. Jangan rekomendasikan resep lain di luar daftar.`;
      const aiResponse = await askGemini(prompt);
      res.json({ rekomendasi: aiResponse });
    } catch (err) {
      res.status(500).json({ message: 'Gagal mendapatkan rekomendasi', error: err.message });
    }
  }
}
module.exports = AIController;