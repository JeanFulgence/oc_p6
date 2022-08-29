const multer = require("multer");

const MIME_TYPES = {
     "image/jpg": "jpg",
     "image/jpeg": "jpg",
     "image/png": "png"
}

// Gestion des fichiers entrants
const storage = multer.diskStorage({

     // Indication de la destination des fichiers entrants, "images"
     destination: (req, file, callback) => {
          callback(null, "images")
     },

     // Création d'un nom d'image unique à partir de son nom et de la date de l'upload
     filename: (req, file, callback) => {
          const name = file.originalname.split(" ").join("_");
          const extension = MIME_TYPES[file.mimetype];
          callback(null, name + Date.now() + "." + extension);
     }
});

module.exports = multer({ 
     storage: storage, 
     limits: { fileSize: 10485760 } // Limite de la taille de l'image: 10Mo
}).single("image");