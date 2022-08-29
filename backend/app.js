const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
require('dotenv').config();

// Exportation des modules de sécurité
const dataSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

// Définition des routes
const userRoutes = require('./routes/userRoute');
const sauceRoutes = require('./routes/sauceRoute');

// Connexion à la base de données MongoDB
mongoose.connect(process.env.DB,
{    useNewUrlParser: true,
     useUnifiedTopology: true })
.then(() => console.log("Connexion à MongoDB réussie."))
.catch(() => console.log("Connexion à MongoDB échouée."));

// Création de l'application express
const app = express();
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Prévention des erreurs de CORS
app.use((req, res, next) => {
     res.setHeader(
          "Access-Control-Allow-Origin", 
          "*"
     );
     res.setHeader(
          "Access-Control-Allow-Headers", 
          "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
     );
     res.setHeader(
          "Access-Control-Allow-Methods", 
          "GET, POST, PUT, DELETE, PATCH, OPTIONS"
     );
     next();
});

app.use(express.json());

// Mesures de sécurité
app.use(dataSanitize({ allowDots: true })); // Protection contre les injections d'opérateur MongoDB (excepté ".")
app.use(hpp()); // Protection contre la pollution des paramètres HTTP

// Application des routes
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;