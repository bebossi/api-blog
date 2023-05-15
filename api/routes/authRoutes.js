const { Router } = require("express");
const isAuth = require("../middleware/isAuth");
const attachCurrentUser = require("../middleware/attachCurrentUser.js");
const AuthController = require("../controllers/auth.js");

const router = Router();

router.get("/users", AuthController.getUsers);
router.get("/users/:userId", AuthController.getUser);
router.post("/users/signup", AuthController.signUp);
router.post("/users/login", AuthController.login);
// router.put("/users", isAuth, attachCurrentUser, AuthController.updateUser);
// router.delete("/users/:userId", AuthController.deleteUser);
// router.post("/users/forgotPassword", AuthController.forgotPassword);
// router.put("/users/updatePassword/:token", AuthController.updatePassword);

module.exports = router;
