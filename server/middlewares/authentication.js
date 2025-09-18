const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

async function authentication(req, res, next) {
  //CHECK USER TOKEN
  const bearerToken = req.headers.authorization;
  console.log("bearerToken", bearerToken);
  if (!bearerToken) {
    res.status(401).json({ message: "Please login first" });
  }
  const [type, token] = bearerToken.split(" ");
  console.log("type", { type, token });

  //VERIFY TOKEN
  try {
    const data = verifyToken(token);
    console.log("data", data);

    //CHECK USER ON DB
    const user = await User.findByPk(data.id);
    if (!user) {
      res.status(401).json({ message: "Please login first" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
}

module.exports = { authentication };
