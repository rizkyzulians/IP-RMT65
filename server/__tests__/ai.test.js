
const request = require("supertest");

describe("POST /ai/rekomendasi", () => {
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
      .send({ question: "Resep nasi goreng?" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("rekomendasi", expect.any(String));
  });

  test("400 - gagal karena question kosong", async () => {
    app = require("../app");
    const res = await request(app)
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
      .send({ question: "Resep apa?" });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Gagal mendapatkan rekomendasi");
    expect(res.body).toHaveProperty("error", expect.any(String));
  });
});
