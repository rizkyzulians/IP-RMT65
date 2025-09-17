const { comparePassword } = require('../helpers/bcrypt');
const { User } = require('../models');
const { signToken } = require('../helpers/jwt');

module.exports = class userController {
    // [POST] /register
      static async register(req, res) {
        try {
          const { name, email, password } = req.body;
          const user = await User.create({ name, email, password})

          res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
          });
        } catch (err) {
          if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({message: err.errors[0].message})
            return;
          } else {
            res.status(500).json({message: "Internal Server Error"})
            return;
          }
        }
      }

      // [POST] /login
        static async login(req, res, next) {
          try {
            const { email, password } = req.body;

            if (!email) {
              res.status(400).json({message: "Email is required"})
            }

            if (!password) {
              res.status(400).json({message: "Password is required"})
              return;
            }

            const user = await User.findOne({ where: {email} })
            if (!user) {
                res.status(401).json({message: "Invalid email/password"})
                return;
            }

            const isPasswordValid = comparePassword(password, user.password)
            if (!isPasswordValid) {
                res.status(401).json({message: "Invalid email/password"})
                return;
            }

            const access_token = signToken({id: user.id, email: user.email})
            res.status(200).json({access_token})

          } catch (err) {
            if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({message: err.errors[0].message})
            return;
          } else {
            res.status(500).json({message: "Internal Server Error"})
            return;
          }
          }
        }
}