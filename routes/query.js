const express = require("express");
const router = express.Router();
const queryController = require("../controllers/queryController");

router.post("/", (req, res, next) => {
    const query = req.body.query; 
    queryController.handleQuery(query, onQuerySuccess, onQueryFailure)
    .then(response => onQuerySuccess(res, response))
    .catch(response => onQueryFailure(res, response))
});

function onQuerySuccess(res, response) {
    res.status(200).json({
        responseMessage: response
    });
}

function onQueryFailure(res) {
    res.status(200).json({
        responseMessage: "I'm sorry, I wasn't able to do that"
    });
}

module.exports = router;