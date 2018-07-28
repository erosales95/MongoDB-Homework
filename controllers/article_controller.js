var axios = require("axios");
var cheerio = require("cheerio");

var express = require("express");
// var app = express();

var router = express.Router();
// grabbing our models

var db = require("../models");

// get route -> index
router.get("/", function (req, res) {
    // send us to the next get function instead.
    //   res.redirect("/scrape");
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle)
            console.log("Found our articleee!!!")
        })
        .catch(function (err) {
            res.json(err)
        })
});
var db = require("../models");


module.exports = router;
