const jwt = require("jsonwebtoken");
 
module.exports = (req, res, next) => {
   try {

          // Récupération du jeton par extraction de la requête via la méthode split
          const token = req.headers.authorization.split(" ")[1];

          // Décodage du jeton via la méthode verify
          const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
          
          // Récupération de l'id de l'utilisateur
          const userId = decodedToken.userId;

          // Ajout de l'id à la requête (qui sera transmise aux routes appelées)
          req.auth = {
               userId: userId
          };
	next();
     } catch(error) {
          res.status(401).json({ error });
     }
}