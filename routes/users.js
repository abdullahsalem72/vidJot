const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

//LOAD USER MODEL
require("./../models/User");
const User = mongoose.model("users");

//USER LOGIN ROUTE
router.get("/login", (req, res) => {
  res.render("users/login");
});
// LOGIN USER FORM
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/ideas",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

//USER REGISTRATION ROUTE
router.get("/register", (req, res) => {
  res.render("users/register");
});
// Registering User
router.post("/register", (req, res) => {
  let errors = [];
  const { body } = req;
  const { name, email, password, password2 } = body;

  if (!(password === password2)) {
    errors.push({ text: "Passwords don't match" });
  }
  if (password.length < 4) {
    errors.push({ text: "Passwords should have more than 4 characters" });
  }
  if (errors.length > 0) {
    return res.render("users/register", {
      user: body,
      errors: errors
    });
  }

  // EMAIL EXISTS??
  User.findOne({ email: email }).then(user => {
    if (user) {
      /* req.flash("error_msg", "Email already Exists!!!");
         res.redirect("/users/register");
         //page relaods resetting all fields
         */
      errors.push({ text: "Email already Exists!!!" });
      return res.render("users/register", { user: body, errors: errors });
      // preserves the fields, but collides with earlier render
    } else {
      //SAVE NEW USER
      const newUser = new User({
        name: name,
        email: email,
        password: password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            console.error(err);
          }
          newUser.password = hash;
          //ADD USER TO DB...
          newUser.save().then(user => {
            req.flash("success_msg", "You are now Registered!!!");
            res.redirect("/users/login");
            return;
          });
        });
      });
    }
  });
});

// LOGOUT USER
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You have logged out");
  res.redirect("/users/login");
});

module.exports = router;
