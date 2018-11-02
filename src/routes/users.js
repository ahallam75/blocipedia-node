const express = require("express");
const router = express.Router();

router.post("/users/signup", userController.signup);

module.exports = router;