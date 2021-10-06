import express, { Router } from "express";

const router = express.Router();

export default (app) => {
  app.use("/auth", router);

  // define the login route
  router.post('/register', function (req, res) {
    // check that password 1 and password 2 match
    // verify that a user with that email does not already exist
    // hash password and create user with details
  });

  // define the login route
  router.post('/login', function (req, res) {
    // check if token already exists
    // check if email is valid
    // check that encrypted password matches
    // create token, update db with token, return
  });

  // define the logout route
  router.get('/logout', function (req, res) {
    // might need AUTH header - check this
    // delete user token

    // delete this later when funct is implemented
    res.status(200).send({data: "logging out"});
  });

}
