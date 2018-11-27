const express = require('express');
const router = express.Router();
const validation = require("./validation");
const User = require("../../src/db/models").User;
const userController = require("../controllers/userController");

router.get("/users/signup", userController.signUp);
router.post("/users/signup", validation.validateUsers, userController.create);
router.get("/users/signin", userController.signInForm);
router.post("/users/signin", validation.validateUsers, userController.signIn);
router.get("/users/signout", userController.signOut);
router.get("/users/:id", userController.show);
router.get("/users/:id/upgrade", userController.showUpgradePage);
router.get("/users/:id/downgrade", userController.showDowngradePage);
router.post("/users/:id/upgrade", userController.upgrade);
router.post("/users/:id/downgrade", userController.downgrade);
router.get("/users/collaborations", userController.showCollaborations);


module.exports = router;