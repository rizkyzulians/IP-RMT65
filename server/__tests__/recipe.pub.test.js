const request = require("supertest");
const app = require("../app");
const { Recipe, sequelize } = require("../models");
const { queryInterface } = sequelize;

test("500 - error getAllRecipePub", async () => {
  jest.spyOn(Recipe, "findAll").mockImplementation(() => { throw new Error("DB error"); });
  const res = await request(app).get("/pub/recipes");
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty("message", "Internal Server Error");
  Recipe.findAll.mockRestore();
});

test("500 - error detailRecipePubbyId", async () => {
  jest.spyOn(Recipe, "findByPk").mockImplementation(() => { throw new Error("DB error"); });
  const res = await request(app).get("/pub/recipes/1");
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty("message", "Internal Server Error");
  Recipe.findByPk.mockRestore();
});

describe("Public Recipe Endpoint", () => {
  let recipeId;
  beforeAll(async () => {
    await queryInterface.bulkDelete("Recipes", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    // seed 2 recipes
    const r1 = await Recipe.create({
      title: "Nasi Goreng",
      image: "https://example.com/nasgor.jpg",
      summary: "Nasi goreng enak dan mudah dibuat.",
      instructions: "1. Panaskan minyak. 2. Masukkan nasi dan bumbu. 3. Aduk hingga matang.",
      ingredients: "nasi, kecap, telur",
      spoonacularId: 101,
      UserId: 1
    });
    const r2 = await Recipe.create({
      title: "Mie Goreng",
      image: "https://example.com/miegoreng.jpg",
      summary: "Mie goreng pedas favorit.",
      instructions: "1. Rebus mie. 2. Tumis bumbu. 3. Campur mie dan bumbu.",
      ingredients: "mie, cabe, telur",
      spoonacularId: 102,
      UserId: 1
    });
    recipeId = r1.id;
  });

  afterAll(async () => {
    await queryInterface.bulkDelete("Recipes", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  });

  test("200 - get all recipes", async () => {
    const res = await request(app).get("/pub/recipes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  test("200 - get all recipes with search", async () => {
    const res = await request(app).get("/pub/recipes?search=Nasi");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toMatch(/Nasi/i);
  });

  test("200 - get all recipes with sort", async () => {
    const res = await request(app).get("/pub/recipes?sort=newest");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("200 - get all recipes with page", async () => {
    const res = await request(app).get("/pub/recipes?page=1");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("200 - get recipe by id", async () => {
    const res = await request(app).get(`/pub/recipes/${recipeId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", recipeId);
    expect(res.body).toHaveProperty("title");
  });

  test("404 - get recipe by id not found", async () => {
    const res = await request(app).get(`/pub/recipes/9999`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Data not found");
  });

  test("200 - get all recipes with search not found", async () => {
    const res = await request(app).get("/pub/recipes?search=tidakadaresep");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
