const { ValidationError } = require("sequelize");
const { test, expect, beforeAll, afterAll, describe } = require("@jest/globals");
const { User, sequelize } = require("../models");
const request = require("supertest");
const { queryInterface } = sequelize;
const app = require("../app");

test("500 - error saat register (simulasi)", async () => {
  jest.spyOn(User, "create").mockImplementation(() => { throw new Error("DB error"); });
  const res = await request(app).post("/register").send({ name: "err", email: "err@mail.com", password: "err123" });
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty("message", "Internal Server Error");
  User.create.mockRestore();
});

describe("POST /login - User Login", () => {
  beforeAll(async () => {
    await User.create({ name: "LoginUser", email: "loginuser@mail.com", password: "loginpass" });
  });

  test("200 - success login", async () => {
    const response = await request(app).post("/login").send({
      email: "loginuser@mail.com",
      password: "loginpass"
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token", expect.any(String));
  });

  test("400 - gagal login tanpa email", async () => {
    const response = await request(app).post("/login").send({
      password: "loginpass"
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Email is required");
  });

  test("400 - gagal login tanpa password", async () => {
    const response = await request(app).post("/login").send({
      email: "loginuser@mail.com"
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Password is required");
  });

  test("401 - gagal login email tidak terdaftar", async () => {
    const response = await request(app).post("/login").send({
      email: "notfound@mail.com",
      password: "somepass"
    });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid email/password");
  });

  test("401 - gagal login password salah", async () => {
    const response = await request(app).post("/login").send({
      email: "loginuser@mail.com",
      password: "wrongpass"
    });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid email/password");
  });
});
test("500 - error saat login (simulasi)", async () => {
  jest.spyOn(User, "findOne").mockImplementation(() => { throw new Error("DB error"); });
  const res = await request(app).post("/login").send({ email: "err@mail.com", password: "err123" });
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty("message", "Internal Server Error");
  User.findOne.mockRestore();
});

const userData = {
  name: "UserTest",
  email: "usertest@mail.com",
  password: "usertest123"
};

let userId;

beforeAll(async () => {
  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});

afterAll(async () => {
  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});

describe("POST /register - User Registration", () => {
  test("201 - success create user", async () => {
    const response = await request(app).post("/register").send(userData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id", expect.any(Number));
    expect(response.body).toHaveProperty("name", userData.name);
    expect(response.body).toHaveProperty("email", userData.email);
    userId = response.body.id;
  });

  test("400 - missing email", async () => {
    const response = await request(app).post("/register").send({
      name: "UserTest",
      password: "usertest123"
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", expect.stringContaining("Email"));
  });

  test("400 - missing password", async () => {
    const response = await request(app).post("/register").send({
      name: "UserTest",
      email: "usertest2@mail.com"
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", expect.stringContaining("Password"));
  });

  test("400 - invalid email format", async () => {
    const response = await request(app).post("/register").send({
      name: "UserTest",
      email: "usertestmail.com",
      password: "usertest123"
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", expect.stringContaining("format"));
  });

  test("400 - password too short", async () => {
    const response = await request(app).post("/register").send({
      name: "UserTest",
      email: "usertest3@mail.com",
      password: "123"
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", expect.stringContaining("min 5"));
  });

  test("400 - duplicate email", async () => {
    await User.create({ name: "UserTestDup", email: "duplicate@mail.com", password: "usertest123" });
    const response = await request(app).post("/register").send({
      name: "UserTestDup",
      email: "duplicate@mail.com",
      password: "usertest123"
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", expect.stringContaining("exists"));
  });
});


