const express = require("express");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");

//DB CONFIG
const db = require("./config/database");

const favicon = require("express-favicon");

// INITIALIZING EXPRESS WITH THE APP VARIABLE
const app = express();

// LOAD ROUTES
const ideas = require("./routes/ideas");
const users = require("./routes/users");

// PASSPORT CONFIG
require("./config/passport")(passport);

// CONNECT TO MONGOOSE
mongoose
  .connect(db.mongoURI)
  .then(() => console.log("MongoDB Connected...."))
  .catch(err => console.log(err));

// EXPRESS-HANDLEBARS MIDDLEWARE SETUP
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//STATIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

//Favicon
app.use(favicon("/img/favicon.ico"));

// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// EXPRESS SESSION MIDDLEWARE
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// PASSPOT MIDDLEWARE (IT HAS TO BE AFTER USER SESSION MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// GLOBAL VARIABLES
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// INDEX ROUTE
app.get("/", (req, res) => {
  const title = "Welcome to the Home Page";
  res.render("index", {
    title: title
  });
});
// ABOUT ROUTE
app.get("/about", (req, res) => {
  res.render("about");
});

//USE ROUTES
app.use("/ideas", ideas);
app.use("/users", users);

//const port = 5000;
// FOR HEROKU
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
