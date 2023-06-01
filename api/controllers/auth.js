const database = require("../models");
const bcrypt = require("bcryptjs");
const generateToken = require("../config/jwt.config");

class AuthController {
  static async signUp(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await database.User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
      });

      return res.status(201).json(user) || user;
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await database.User.findOne({ where: { email: email } });
      if (!user) {
        throw new Error();
      }
      if (await bcrypt.compare(password, user.password)) {
        const token = generateToken(user);
        return res.status(200).json({
          user: {
            firstName: user.firstName,
            email: user.email,
            id: user.id,
            role: user.role,
          },
          token: token,
        });
      } else {
        return res
          .status(404)
          .json({ message: "Email ou senha inválidossssss" });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  }

  static async getUsers() {
    try {
      const users = await database.User.findAll();
      return users;
    } catch (err) {
      console.log(err);
    }
  }

  static async getUser(id) {
    try {
      const user = await database.User.findOne({
        where: { id },
      });
      return user;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = AuthController;
