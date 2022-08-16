const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator");

// Création du schéma de l'objet utilisateur
const userSchema = mongoose.Schema({
     email: { type: String, required: true, unique: true },
     password: { type: String, required: true }
});

// Application de mongoose-unique-validator pour prévenir l'utilisation d'un même e-mail pour deux comptes
userSchema.plugin(uniqueValidator);

// Exportation du schéma en tant que modèle Mongoose appelé "User"
module.exports = mongoose.model("User", userSchema);