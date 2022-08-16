// Importation des modules de sécurité pour les identifiants
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Importation du modèle d'utilisateur
const User = require("../models/userModel");

// Création d'un compte
exports.signup = (req, res, next) => {
     bcrypt
     .hash(req.body.password, 12)
     .then(hash => {
          const user = new User({
               email: req.body.email,
               password: hash
          });
          user.save()
          .then(() => res.status(201).json({ message: "Utilisateur créé avec succès." }))
          .catch(error => res.status(400).json({ error }));
     })
     .catch(error => {
          console.log(error);
          return res.status(500).json({ error });
     });
}

// Connexion à un compte
exports.login = (req, res, next) => {
     User.findOne({ email: req.body.email })
     .then(user => {
          // Vérification de l'existence de l'utilisateur dans la base de données
          if (!user) {
               return res.status(401).json({ error: "Votre identifiant/mot de passe est incorrect." });
          }
          bcrypt.compare(req.body.password, user.password)
          .then(valid => {
               // Vérification du mot de passe
               if (!valid) {
                    return res.status(401).json({ error: "Votre identifiant/mot de passe est incorrect." });
               }
               res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                         { userId: user._id },
                         "RANDOM_TOKEN_SECRET",
                         { expiresIn: "24h" }
                    )
               });
          })
          .catch(error => res.status(500).json({ error }));
     })
     .catch(error => res.status(500).json({ error }));
}