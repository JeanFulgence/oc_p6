// Importation du modèle de sauce et du package file system nécessaire pour la suppression d'une sauce
const Sauce = require("../models/sauceModel");
const fs = require("fs");

// Récupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
     Sauce.find()
     .then((sauces) => res.status(200).json(sauces))
     .catch((error) => res.status(400).json({ error }));
}

// Récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
     Sauce.findOne({ _id: req.params.id })
     .then((sauce) => res.status(200).json(sauce))
     .catch((error) => res.status(404).json({ error }));
}

// Création d'une sauce
exports.createSauce = (req, res, next) => {
     const sauceObject = JSON.parse(req.body.sauce);
     delete sauceObject._id;
     const sauce = new Sauce({
          ...sauceObject,
          imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
          likes: 0,
          dislikes: 0,
          usersLiked: [],
          usersDisliked: []
     });
     sauce.save()
     .then(() => { res.status(201).json({ message: "Nouvelle sauce enregistrée!"}) })
     .catch(error => { res.status(400).json({ error })});
}

// Modification d'une sauce
exports.modifySauce = (req, res, next) => {
     const sauceObject = req.file ? {
         ...JSON.parse(req.body.sauce),
         imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`} : { ...req.body };
     Sauce.updateOne({ _id : req.params.id}, {...sauceObject, _id: req.params.id})
     .then(res.status(200).json({ message : "Sauce modifiée"}))
     .catch(error => res.status(400).json({ error }))
}

// Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
     Sauce.findOne({ _id: req.params.id })
     .then(sauce => {
          if (sauce.userId != req.auth.userId) {
               res.status(401).json({message: 'Non autorisé.'});
          } else {
               const filename = sauce.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                    .then(() => { res.status(200).json({message: 'Sauce supprimée.'})})
                    .catch(error => res.status(400).json({ error }));
               });
          }
     })
     .catch( error => res.status(500).json({ error }));
};
/*
exports.opinionSauce = (req, res, next) => {
     
}*/