const express = require("express");
const router = express.Router();

// Mitige les attaques brute force en bloquant les tentatives de connexion répétées
const bouncer = require("express-bouncer")(30000, 600000, 3); // 30sec, 10min, 3 tentatives

// Appel de la logique métier
const userCtrl = require("../controllers/userController");

// Mise en place des routes pour les différentes requêtes
router.post("/signup", userCtrl.signup);
router.post("/login", bouncer.block, userCtrl.login);

module.exports = router;