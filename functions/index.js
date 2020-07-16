const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const express = require('express');
const app = express();
app.set('view engine', 'pug');
app.set('views', './views');

const result = require("./result.js")

app.get('/', (req, res) => {
    res.render("home");
});

app.use("/result", result, (req, res, next) => {
    console.log(req.query)
    next();
})

exports.home = functions.https.onRequest(app)