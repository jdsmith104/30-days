var express = require('express');
var router = express.Router();

exercises = [
    {
        name: "Push Up",
        easy: 5,
        medium: 10,
        hard: 20
    },
    {
        name: "Sit Up",
        easy: 15,
        medium: 30,
        hard: 50
    },
    {
        name: "Crunch",
        easy: 10,
        medium: 20,
        hard: 30
    },
    {
        name: "Sqaut",
        easy: 20,
        medium: 40,
        hard: 60
    }
]

difficulties = ["easy", "medium", "hard"]



router.get('/', (req, res) => {
    try {
        // Sanitise query params
        const quantity = parseInt(req.query.quantity)
        const difficulty = req.query.difficulty
        if (isNaN(quantity) | !difficulties.includes(difficulty)) {
            console.error("Quantity", quantity, "Difficulty", difficulty);
            res.send("Unable to generate exercise")
        } else {
            res.render("result", {
                name: "Jacob",
                rows: difficulty
            })

        }

    } catch (error) {
        console.log(req.query)
        res.send("Some error/exception has occured")
    }
});
router.post('/', (req, res) => {
    res.send('POST route on things.');
});

//export this router to use in our index.js
module.exports = router;