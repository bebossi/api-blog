const database = require("../models");

async function attachCurrentUser(req, res, next) {
  try {
    const userData = req.auth;

    const user = await database.User.findOne({
      where: { id: Number(userData.id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.currentUser = user;

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
}

module.exports = attachCurrentUser;
