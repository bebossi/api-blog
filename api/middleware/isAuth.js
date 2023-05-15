const { expressjwt } = require("express-jwt");
const dotenv = require("dotenv");

dotenv.config();

module.exports = authMiddleware = expressjwt({
  secret: process.env.TOKEN_SIGN_SECRET,
  algorithms: ["HS256"],
});
