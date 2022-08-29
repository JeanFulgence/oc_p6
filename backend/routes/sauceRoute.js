const express = require("express");
const router = express.Router();
const multer = require("../middleware/multerConfig");
const auth = require("../middleware/auth");

// Appel de la logique métier
const sauceCtrl = require("../controllers/sauceController");

// Mise en place des routes pour les différentes requêtes
router.get("/", auth, sauceCtrl.getAllSauces);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.put("/:id", auth, multer, sauceCtrl.modifySauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.post("/:id/like", auth, sauceCtrl.opinionOnSauce);

module.exports = router;