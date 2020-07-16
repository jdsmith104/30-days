var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render("result", {
        name: "Jacob",
        rows: "req.params.rows"
    })
    console.log("Doing stuff")
});
router.post('/', (req, res) => {
    res.send('POST route on things.');
});

//export this router to use in our index.js
module.exports = router;