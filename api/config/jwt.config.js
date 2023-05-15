const jwt = require("jsonwebtoken");

function generateToken(user) {
  const { id, firstName, email } = user;

  const signature = process.env.TOKEN_SIGN_SECRET;

  const expiration = "8h";

  return jwt.sign({ id, firstName, email }, signature, {
    expiresIn: expiration,
  });
}
module.exports = generateToken;
