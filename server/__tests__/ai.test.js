
const request = require("supertest");

describe("POST /ai/rekomendasi", () => {
  const validRecipes = [
    { id: 1, title: "Nasi Goreng", ingredients: "nasi, telur, kecap" },
    { id: 2, title: "Rendang", ingredients: "daging sapi, santan, rempah" }
  ];

  let app;
  let gemini;
  beforeEach(() => {
    jest.resetModules();
    gemini = require("../helpers/gemini");
  });

  test("200 - sukses dapat rekomendasi dari AI", async () => {
    jest.spyOn(gemini, "askGemini").mockResolvedValue("Resep: Nasi Goreng Spesial");
    app = require("../app");
    const res = await request(app)
      .post("/ai/rekomendasi")
      .send({ question: "Resep nasi goreng?", recipes: validRecipes });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("rekomendasi", expect.any(String));
  });

  test("400 - gagal karena question kosong", async () => {
    app = require("../app");
    // no question, with recipes
    let res = await request(app)
      .post("/ai/rekomendasi")
      .send({ recipes: validRecipes });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Pertanyaan tidak boleh kosong");
    // no question, no recipes
    res = await request(app)
      .post("/ai/rekomendasi")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Pertanyaan tidak boleh kosong");
  });

  test("500 - gagal karena error dari AI", async () => {
    jest.spyOn(gemini, "askGemini").mockRejectedValue(new Error("API error"));
    app = require("../app");
    const res = await request(app)
      .post("/ai/rekomendasi")
      .send({ question: "Resep apa?", recipes: validRecipes });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Gagal mendapatkan rekomendasi");
    expect(res.body).toHaveProperty("error", expect.any(String));

  });

  test("400 - gagal karena recipes tidak dikirim", async () => {
    app = require("../app");
    const res = await request(app)
      .post("/ai/rekomendasi")
      .send({ question: "Apa saja?" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", expect.stringContaining("Daftar resep harus dikirim"));
  });

  test("400 - gagal karena recipes kosong", async () => {
    app = require("../app");
    const res = await request(app)
      .post("/ai/rekomendasi")
      .send({ question: "Apa saja?", recipes: [] });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", expect.stringContaining("Daftar resep harus dikirim"));
  });

  test("400 - gagal karena recipes bukan array", async () => {
    app = require("../app");
    const res = await request(app)
      .post("/ai/rekomendasi")
      .send({ question: "Apa saja?", recipes: "bukanarray" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", expect.stringContaining("Daftar resep harus dikirim"));
  });

  test("200 - sukses dengan ingredients kosong/null", async () => {
    jest.spyOn(gemini, "askGemini").mockResolvedValue("Resep: Unknown");
    app = require("../app");
    const res = await request(app)
      .post("/ai/rekomendasi")
      .send({ question: "Apa saja?", recipes: [{ id: 1, title: "Test" }] });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("rekomendasi", expect.any(String));
  });
});
