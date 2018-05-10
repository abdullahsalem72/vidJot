const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// LOAD HELPER ROUTES (ENSURE AUTTHED)
const { ensureAuthenticated } = require("./../helpers/auth");

//Load Idea model
require("./../models/Idea");
const Idea = mongoose.model("ideas");

//IDEA MAIN PAGE...
router.get("/", ensureAuthenticated, (req, res) => {
  Idea.find({ userId: req.user.id })
    .sort({ date: "desc" })
    .then(ideas => {
      res.render("ideas/index", {
        ideas: ideas
      });
    });
});

//ADD IDEA ROUTE
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("ideas/add");
});

// Process Forms
router.post("/", ensureAuthenticated, (req, res) => {
  let errors = [];
  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please add a Details" });
  }

  if (errors.length > 0) {
    res.render("ideas/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newIdea = {
      title: req.body.title,
      details: req.body.details,
      userId: req.user.id
    };
    new Idea(newIdea).save().then(idea => {
      req.flash("success_msg", "Idea was successfully Added");
      res.redirect("/ideas");
    });
  }
});

// EDIT IDEA....
//Edit
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    if (idea.userId !== req.user.id) {
      req.flash("error_msg", "Not Authorized");
      res.redirect("/ideas");
    } else {
      res.render("ideas/edit", {
        idea: idea
      });
    }
  });
});

//EDIT FORM PROCESS...edit
router.put("/:id", ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    //new values
    (idea.title = req.body.title), (idea.details = req.body.details);
    idea.save().then(idea => {
      req.flash("success_msg", "Idea was successfully Edited");
      res.redirect("/ideas");
    });
  });
});

// DELETE IDEA.
router.delete("/:id", ensureAuthenticated, (req, res) => {
  Idea.remove({
    _id: req.params.id
  }).then(() => {
    req.flash("success_msg", "Idea was successfully deleted");
    res.redirect("/ideas");
  });
});

module.exports = router;
