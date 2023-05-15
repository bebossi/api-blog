const bodyParser = require("body-parser");
const auth = require("./authRoutes.js");

module.exports = (app) => {
  app.use(bodyParser.json());
  app.use(auth);
};
