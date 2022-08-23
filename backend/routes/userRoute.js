const express = require("express");
const router = express.Router();

// Mitige les attaques brute force en bloquant les tentatives de connexion répétées
const bouncer = require("express-bouncer")(30000, 600000, 3); // 30sec, 10min, 3 tentatives

const userCtrl = require("../controllers/userController");

router.post("/signup", userCtrl.signup);
router.post("/login", bouncer.block, userCtrl.login);

module.exports = router;