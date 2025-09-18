const { comparePassword } = require("../helpers/bcrypt");
const { User } = require("../models");
const { signToken } = require("../helpers/jwt");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();


module.exports = class userController {
  // [POST] /login/google
  static async googleLogin(req, res, next) {
    try {
      const id_token = req.body.id_token;
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
      
        const user = await User.findOne({ where: { email: payload.email } });

        if (user) {
          const access_token = signToken({ id: user.id });
          return res.status(200).json({ access_token });
        } else {
          const newUser = await User.create({
            name: payload.name,
            email: payload.email,
            password: Math.random().toString(36).slice(-8),
          });
          const access_token = signToken({ id: newUser.id });
          return res.status(201).json({ access_token });
        }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // [POST] /register
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      const user = await User.create({ name, email, password });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (err) {
      if (
        err.name === "SequelizeValidationError" ||
        err.name === "SequelizeUniqueConstraintError"
      ) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      } else {
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
    }
  }

  // [POST] /login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
      }

      if (!password) {
        res.status(400).json({ message: "Password is required" });
        return;
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ message: "Invalid email/password" });
        return;
      }

      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid email/password" });
        return;
      }

      const access_token = signToken({ id: user.id, email: user.email });
      res.status(200).json({ access_token });
    } catch (err) {
      if (
        err.name === "SequelizeValidationError" ||
        err.name === "SequelizeUniqueConstraintError"
      ) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      } else {
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
    }
  }
};
