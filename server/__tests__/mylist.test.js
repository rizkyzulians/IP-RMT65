
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require("supertest");
const { User, Recipe, MyList, sequelize } = require("../models");
const { signToken } = require("../helpers/jwt");
const app = require("../app");
const { queryInterface } = sequelize;

describe("MyList Controller", () => {
  let user, user2, recipe, token, token2;

  beforeAll(async () => {
    await queryInterface.bulkDelete("MyLists", null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete("Recipes", null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete("Users", null, { truncate: true, cascade: true, restartIdentity: true });
    user = await User.create({ name: "User1", email: "user1@mail.com", password: "password1" });
    user2 = await User.create({ name: "User2", email: "user2@mail.com", password: "password2" });
    token = signToken({ id: user.id, email: user.email });
    token2 = signToken({ id: user2.id, email: user2.email });
    recipe = await Recipe.create({
      title: "Nasi Goreng",
      image: "https://example.com/nasgor.jpg",
      summary: "Nasi goreng enak dan mudah dibuat.",
      instructions: "1. Panaskan minyak. 2. Masukkan nasi dan bumbu. 3. Aduk hingga matang.",
      ingredients: "nasi, kecap, telur",
      spoonacularId: 101
    });
  });

  // Simulasi error 500 untuk semua endpoint
  test("500 - error getMyList (simulasi)", async () => {
    jest.spyOn(MyList, "findAll").mockImplementation(() => { throw new Error("DB error"); });
    const res = await request(app).get("/mylist").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Internal server error");
    MyList.findAll.mockRestore();
  });
  test("500 - error addToMyList (simulasi)", async () => {
    jest.spyOn(MyList, "findOne").mockImplementation(() => { throw new Error("DB error"); });
    const res = await request(app).post("/mylist").set("Authorization", `Bearer ${token}`).send({ RecipeId: recipe.id, note: "err" });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Internal server error");
    MyList.findOne.mockRestore();
  });
  test("500 - error removeFromMyList (simulasi)", async () => {
    jest.spyOn(MyList, "destroy").mockImplementation(() => { throw new Error("DB error"); });
    const res = await request(app).delete(`/mylist/${recipe.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Internal server error");
    MyList.destroy.mockRestore();
  });
  test("500 - error updateNote (simulasi)", async () => {
    jest.spyOn(MyList, "findOne").mockImplementation(() => { throw new Error("DB error"); });
    const res = await request(app).patch(`/mylist/${recipe.id}`).set("Authorization", `Bearer ${token}`).send({ note: "err" });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Internal server error");
    MyList.findOne.mockRestore();
  });

  afterAll(async () => {
    await queryInterface.bulkDelete("MyLists", null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete("Recipes", null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete("Users", null, { truncate: true, cascade: true, restartIdentity: true });
  });

  describe("POST /mylist", () => {
    test("201 - berhasil tambah ke mylist", async () => {
      const res = await request(app)
        .post("/mylist")
        .set("Authorization", `Bearer ${token}`)
        .send({ RecipeId: recipe.id, note: "Favorit" });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "Recipe added to my list");
      expect(res.body.myList).toHaveProperty("UserId", user.id);
      expect(res.body.myList).toHaveProperty("RecipeId", recipe.id);
    });
    test("400 - gagal tambah karena sudah ada", async () => {
      await MyList.create({ UserId: user.id, RecipeId: recipe.id, note: "Favorit" });
      const res = await request(app)
        .post("/mylist")
        .set("Authorization", `Bearer ${token}`)
        .send({ RecipeId: recipe.id, note: "Favorit" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Recipe already in your list");
    });
    test("401 - gagal tambah tanpa token", async () => {
      const res = await request(app)
        .post("/mylist")
        .send({ RecipeId: recipe.id, note: "Favorit" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /mylist", () => {
    test("200 - get mylist user", async () => {
      const res = await request(app)
        .get("/mylist")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("myList");
      expect(Array.isArray(res.body.myList)).toBe(true);
    });
    test("401 - gagal get tanpa token", async () => {
      const res = await request(app).get("/mylist");
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /mylist/:RecipeId", () => {
    test("200 - berhasil hapus dari mylist", async () => {
      await MyList.create({ UserId: user.id, RecipeId: recipe.id, note: "Favorit" });
      const res = await request(app)
        .delete(`/mylist/${recipe.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Recipe removed from my list");
    });
    test("404 - gagal hapus karena tidak ada", async () => {
      const res = await request(app)
        .delete(`/mylist/9999`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Recipe not found in your list");
    });
    test("401 - gagal hapus tanpa token", async () => {
      const res = await request(app).delete(`/mylist/${recipe.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /mylist/:RecipeId", () => {
    test("200 - berhasil update note", async () => {
      await MyList.create({ UserId: user.id, RecipeId: recipe.id, note: "Favorit" });
      const res = await request(app)
        .patch(`/mylist/${recipe.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ note: "Updated note" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Notes updated");
      expect(res.body.myList).toHaveProperty("note", "Updated note");
    });
    test("404 - gagal update note karena tidak ada", async () => {
      const res = await request(app)
        .patch(`/mylist/9999`)
        .set("Authorization", `Bearer ${token}`)
        .send({ note: "Updated note" });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Recipe not found in your list");
    });
    test("401 - gagal update note tanpa token", async () => {
      const res = await request(app)
        .patch(`/mylist/${recipe.id}`)
        .send({ note: "Updated note" });
      expect(res.status).toBe(401);
    });
  });
});
