const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore()

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

const result = require("./result.js");
const { query } = require('express');

const MAX_SEED = 1000

app.get('/', (req, res) => {
    res.render("home");
});

app.use("/result", result, (req, res, next) => {
    console.log(req.query)
    next();
})

exports.home = functions.https.onRequest(app)


/* 
curl -X POST -d "Name=Press%20up&Easy=5&Medium=10&Hard=20" http://localhost:5001/days-web/us-central1/addExercise
curl -X POST -d "Name=Squat&Easy=20&Medium=40&Hard=60" http://localhost:5001/days-web/us-central1/addExercise
curl -X POST -d "Name=Sit%20up&Easy=10&Medium=20&Hard=30" http://localhost:5001/days-web/us-central1/addExercise
curl -X POST -d "Name=Crunch&Easy=10&Medium=20&Hard=30" http://localhost:5001/days-web/us-central1/addExercise
 */

//  Sample post request to add an exercise
exports.addExercise = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const exercise = req.body;
    exercise.random = Math.random() * MAX_SEED
    console.log("Attempting to add exercise")
    console.log(req.body)
    // Push the new message into Cloud Firestore using the Firebase Admin SDK.
    const writeResult = await db.collection('Exercises').add(exercise);
    // Send back a message that we've succesfully written the message
    res.status(200).json({ result: `Message with ID: ${writeResult.id} added.` });
});

exports.getAllExcercise = functions.https.onRequest((req, res) => {
    db.collection("Exercises").get().then(querySnapshot => {
        res.status(200).send(querySnapshot.docs.map(doc => doc.data()))
    }).catch(reason => {
        console.error(reason)
        res.status(500).send("Error getting document")
    })
})


exports.getExcercise = functions.https.onRequest((req, res) => {
    // Query for exercise by name and return JSON
    const query = req.query.name
    if (query === undefined) {
        // Handles no exercise provided with correct query
        res.status(200).send("No query provided")
    } else {
        const responseArray = []
        console.log(query)
        db.collection("Exercises").where("Name", "==", query)
            .get()
            .then(querySnapshot => {
                querySnapshot.forEach(function (doc) {
                    // doc.data() is never undefined for query doc snapshots
                    responseArray.push(doc.data())
                });
                if (responseArray.length === 0) res.status(200).send("No matching name found")
                else res.status(200).send(responseArray[0])

            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
                res.status(500).send("Error getting documents")
            });
    }
})

// https://stackoverflow.com/questions/46798981/firestore-how-to-get-random-documents-in-a-collection
exports.getRandomExcercise = functions.https.onRequest((req, res) => {
    // Get random exercise
    const random = Math.random() * MAX_SEED
    db.collection("Exercises").where("random", ">=", random).orderBy("random").limit(1)
        .get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                // Handle no documents found
                db.collection("Exercises").where("random", ">=", 0).orderBy("random").limit(1)
                    .get()
                    .then(querySnapshot => {
                        if (querySnapshot.size === 0) res.status(200).send("No document found")
                        else res.status(200).send(querySnapshot.docs[0].data())
                    })
                    .catch(function (error) {
                        console.log("Error getting documents: ", error);
                        res.status(500).send("Error getting documents")
                    });
            }
            else {
                res.status(200).send(querySnapshot.docs[0].data())
            }
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
            res.status(500).send("Error getting documents")
        });
    console.log("Random:", random)
})

exports.getRandomExcercises = functions.https.onRequest((req, res) => {
    // Get random exercise
    const quantity = parseInt(req.query.quantity)
    let picks;
    try {
        if (quantity === undefined) {
            picks = 1
        } else {
            picks = parseInt(quantity)
            if (!Number.isInteger(picks)) {
                console.log("Not a number. Setting picks to 1");
                picks = 1;
            }
        }
    } catch (error) {
        console.log("There has been a conversion error.", error)
    }
    db.collection("Exercises").get().then(querySnapshot => {
        const documentArray = querySnapshot.docs
        if (documentArray.length === 0 | documentArray.length < picks) {
            res.status(200).send("Query not continued. Number of items in db", documentArray.length, "and number of picks", picks)
        } else if (documentArray.length === picks) {
            console.log("Sending ordered list")
            res.status(200).send(documentArray.map(document => document.data()))
        } else {
            // Desired branch. Number of picks is < the number of elements to pick from.
            const subCollectionArray = customFisherYates(documentArray, picks).map(document => document.data())
            res.status(200).send(subCollectionArray)

        }
    }).catch(reason => {
        console.error(reason)
        res.status(500).send("Error getting document")
    })


})



/* 
curl -X POST -d "Name=Press%20up&Easy=5&Medium=10&Hard=20" http://localhost:5001/days-web/us-central1/updateExcercise?name=Press%20up
curl -X POST -d "Name=Sit%20up&Easy=1000&Medium=100&Hard=100" http://localhost:5001/days-web/us-central1/updateExcercise?name=Sit%20up
curl -X POST -d "Name=Squat&Easy=20&Medium=40&Hard=60" http://localhost:5001/days-web/us-central1/updateExcercise?name=
curl -X POST -d "Name=Crunch&Easy=10&Medium=20&Hard=30" http://localhost:5001/days-web/us-central1/updateExcercise?name=Crunch
 */
exports.updateExcercise = functions.https.onRequest((req, res) => {
    // Patch request?
    const name = req.query.name;
    console.log(name)
    if (name === undefined) {
        res.status(200).send("Bad query")
    } else {
        db.collection("Exercises").where("Name", "==", name).get().then(querySnapshot => {
            if (querySnapshot.empty) {
                res.status(200).send("No document found")
            } else {
                const document = querySnapshot.docs[0]
                const settings = Object.assign({}, document.data())
                if (req.body.Easy !== undefined) settings.Easy = req.body.Easy
                if (req.body.Medium !== undefined) settings.Medium = req.body.Medium
                if (req.body.Hard !== undefined) settings.Hard = req.body.Hard
                if (req.body.Name !== undefined) settings.Name = req.body.Name
                db.collection("Exercises").doc(document.id).update(settings)
                // Updated document (Object)
                res.status(200).json(settings)
            }
        }).catch(reason => {
            console.error(reason)
            res.status(500).send("Not sure how to handle this")
        })
    }

})

// Probably works
function customFisherYates(documentArray, picks) {
    const pickArray = []
    for (i = documentArray.length - 1; i > documentArray.length - 1 - picks; i--) {
        const rand = Math.floor(Math.random() * i);
        const hold = documentArray[i]
        pickArray.push(documentArray[rand])
        documentArray[i] = documentArray[rand]
        documentArray[rand] = hold
    }
    return documentArray.slice(-1 * picks)
}