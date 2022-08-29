// Importation du modèle de sauce et du package file system nécessaire pour la suppression d'une sauce
const Sauce = require("../models/sauceModel");
const fs = require("fs");

// Création d'une expression régulière pour la saisie des champs de la sauce
let regex = /^[A-Za-zÀ-ÖØ-öø-ÿ'0-9 -_.,!?&]+$/;

// Fonction de récupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
     Sauce.find()
     .then((sauces) => res.status(200).json(sauces))
     .catch((error) => res.status(400).json({ error }));
}

// Fonction de récupération d'une sauce
exports.getOneSauce = (req, res, next) => {

     // Récupération de la sauce via l'id de la requête
     Sauce.findOne({ _id: req.params.id })
     .then((sauce) => res.status(200).json(sauce))
     .catch((error) => res.status(404).json({ error }));
}

// Fonction de création d'une sauce
exports.createSauce = (req, res, next) => {
     const sauceObject = JSON.parse(req.body.sauce);
     delete sauceObject._id;

     // Vérification de l'expression régulière
     if (!regex.test(sauceObject.name) ||
     !regex.test(sauceObject.manufacturer) ||
     !regex.test(sauceObject.description) ||
     !regex.test(sauceObject.mainPepper)
     ) {
          return res.status(500)
          .json({ error: "Certains champs contiennent des caractères non-valides." });
     } else {
          const sauce = new Sauce({

               // Création d'une nouvelle sauce à partir du corps de la requête
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
}

// Fonction de modification d'une sauce
exports.modifySauce = (req, res, next) => {
     
     // Récupération de la sauce via l'id de la requête
     Sauce.findOne({ _id: req.params.id })
     .then(sauce => {
          
          // Vérification de la correspondance entre créateur de la sauce et l'utilisateur qui souhaite la modifier
          if (sauce.userId != req.auth.userId) {
               res.status(401).json({message: "Non autorisé."});

          // Mise à jour de la sauce
          } else {
               const sauceObject = req.file ? {
               
               // Modification de la sauce à partir du corps de la requête
               ...JSON.parse(req.body.sauce),
               imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`} : { ...req.body };
               
               // Mise à jour de la sauce
               Sauce.updateOne({ _id : req.params.id}, {...sauceObject, _id: req.params.id})
               .then(res.status(200).json({ message : "Sauce modifiée"}))
               .catch(error => res.status(400).json({ error }));
          }
     })
     .catch( error => res.status(500).json({ error }));
}

// Fonction de suppression d'une sauce
exports.deleteSauce = (req, res, next) => {

     // Récupération de la sauce via l'id de la requête
     Sauce.findOne({ _id: req.params.id })
     .then(sauce => {

          // Vérification de la correspondance entre créateur de la sauce et l'utilisateur qui souhaite l'effacer
          if (sauce.userId != req.auth.userId) {
               res.status(401).json({message: "Non autorisé."});

          // Suppression de la sauce
          } else {

               // Suppression de l'image de la sauce
               const filename = sauce.imageUrl.split("/images/")[1];
               fs.unlink(`./images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                    .then(() => { res.status(200).json({message: "Sauce supprimée."})})
                    .catch(error => res.status(400).json({ error }));
               });
          }
     })
     .catch( error => res.status(500).json({ error }));
}

// Fonction like/dislike
exports.opinionOnSauce = (req, res, next) => {
     // Gestion des trois types d'envoi du frontend: "1", "0", et "-1"
     switch (req.body.like) {

          /* Ajout d'un like et de l'id de l'utilisateur dans les 
          propriétés "likes" et "usersLiked" de la sauce si on reçoit "1" du front */
          case 1 :
               Sauce.findOne({ _id: req.params.id })
               .then((sauce) => {

                    // Vérifie si l'utilisateur a déjà mis un like à la sauce
                    if (sauce.usersLiked.includes(req.body.userId)) {
                         res.status(401).json({message: "Non autorisé."});

                    /* Si l'utilisateur a mis un "dislike", retire son id de "usersDisliked", ajoute -1 aux "dislikes" 
                    puis ajout de son id dans "usersLiked" et incrémentation de "likes".
                    Le code du frontend prévenant ce cas de figure, cette partie permet de s'assurer 
                    qu'aucun dysfonctionnement n'intervienne en cas de modification du frontend. */
                    } else if (sauce.usersDisliked.includes(req.body.userId)) {
                         Sauce.updateOne(
                              { _id: req.params.id },
                              { $push: { usersLiked: req.body.userId }, 
                              $pull: { usersDisliked: req.body.userId },
                              $inc: { likes: +1, dislikes: -1 }})
                         .then(() => res.status(200).json({ message: "Like!" }))
                         .catch((error) => res.status(400).json({ error }));

                    // Ajout de l'id de l'utilisateur dans "usersLiked" et incrémentation de "likes"
                    } else {
                         Sauce.updateOne(
                              { _id: req.params.id },
                              { $push: { usersLiked: req.body.userId },
                              $inc: { likes: +1 }})
                         .then(() => res.status(200).json({ message: "Like!" }))
                         .catch((error) => res.status(400).json({ error }))
                    }
               })
               .catch((error) => res.status(404).json({ error }));
          break;
        
          case 0 :
               Sauce.findOne({ _id: req.params.id })
               .then((sauce) => {

                    // Si l'utilisateur enlève son like
                    if (sauce.usersLiked.includes(req.body.userId)) { 
                         Sauce.updateOne(
                              { _id: req.params.id },
                              // Retrait de l'id de l'utilisateur de usersLiked
                              { $pull: { usersLiked: req.body.userId },
                              $inc: { likes: -1 }})
                         .then(() => res.status(200).json({ message: "None." }))
                         .catch((error) => res.status(400).json({ error }));
                    }
                    
                    // Si l'utilisateur enlève son dislike
                    if (sauce.usersDisliked.includes(req.body.userId)) { 
                         Sauce.updateOne(
                              { _id: req.params.id },
                              // Retrait de l'id de l'utilisateur de usersDisliked
                              { $pull: { usersDisliked: req.body.userId },
                              $inc: { dislikes: -1 }})
                         .then(() => res.status(200).json({ message: "None." }))
                         .catch((error) => res.status(400).json({ error }));
                    }
               })
               .catch((error) => res.status(404).json({ error }));
          break;
        
          /* Ajout d'un dislike et de l'id de l'utilisateur dans les 
          propriétés "dislikes" et "usersDisliked" de la sauce si on reçoit "-1" du front */
          case -1 :
          Sauce.findOne({ _id: req.params.id })
               .then((sauce) => {

                    // Vérifie si l'utilisateur a déjà mis un dislike à la sauce
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                         res.status(401).json({message: "Non autorisé."});
                    
                    /* Si l'utilisateur a mis un "like", retire son id de "usersLiked", ajoute -1 aux "likes" 
                    puis ajout de son id dans "usersDisliked" et incrémentation de "dislikes".
                    Le code du frontend prévenant ce cas de figure, cette partie permet de s'assurer 
                    qu'aucun dysfonctionnement n'intervienne en cas de modification du frontend. */
                    } else if (sauce.usersLiked.includes(req.body.userId)) {
                         Sauce.updateOne(
                              { _id: req.params.id },
                              { $push: { usersDisliked: req.body.userId }, 
                              $pull: { usersLiked: req.body.userId },
                              $inc: { dislikes: +1, likes: -1 }})
                         .then(() => res.status(200).json({ message: "Yikes!" }))
                         .catch((error) => res.status(400).json({ error }));

                    // Ajout de l'id de l'utilisateur dans "usersLiked" et incrémentation de "likes"
                    } else {
                         Sauce.updateOne(
                              { _id: req.params.id },
                              { $push: { usersDisliked: req.body.userId },
                              $inc: { dislikes: +1 }})
                         .then(() => { res.status(200).json({ message: "Yikes!" }) })
                         .catch((error) => res.status(400).json({ error }));
                    }
               })
               .catch((error) => res.status(404).json({ error }));
          break;

          default:
          console.log(error);
     }
}