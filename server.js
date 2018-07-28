var express = require("express");
var bodyParser = require("body-parser");
// var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");

//bring in the models
var db = require("./models");



//using this for the port
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

var routes = require("./controllers/article_controller");

app.use(routes);

app.get("/", function (req, res) {
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


app.get("/scrape", function (req, res) {
    console.log("*We got into our /scrape!!*")
    
    // First, we grab the body of the html with request
    axios.get("http://www.chicagotribune.com/news/trending/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        
        // Now, we grab every h2 within an article tag, and do the following:
        $(".trb_outfit_group_list_item_body h3").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log("Our scraping worked!! ", dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
        });

        // If we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete");
    });
});



var PORT = 8080;
// Start the server
app.listen(PORT, function() {
    console.log("App running on http://localhost:" + PORT + " !");
  });
  