const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const userRoutes = require('./routes/userRoute')
const sauceRoutes = require('./routes/sauceRoute')

mongoose.connect("mongodb+srv://Jean:Araflore24@cluster0.kd3z567.mongodb.net/?retryWrites=true&w=majority",
{    useNewUrlParser: true,
     useUnifiedTopology: true })
.then(() => console.log("Connexion à MongoDB réussie."))
.catch(() => console.log("Connexion à MongoDB échouée."));

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

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;