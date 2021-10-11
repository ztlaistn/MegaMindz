import express, { Router } from "express";
import AuthService from "../services/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

export default (app) => {
  app.use("/auth", router);

  // register a new user
  router.post('/register', function (req, res) {
    // ensure all required data is present
    const { username, email, password1, password2 } = req.body;
    if (!(email && username && password1 && password2)) {
      res.status(400).send("All input is required");
    }

    const response = AuthService.register(req.body);

    if (response.isSuccess) {
      res.status(201).send("Account successfully created");
    } else {
      res.status(409).send(response.errorMsg);
    }
  });

  // define the login route
  router.post('/login', function (req, res) {
    // making sure all login credentials provided
    const {email,password} = req.body;
    if (!(email || password)) {
      res.status(400).send("All input is required");
    }
    // AuthService.logIn(req.body) will check if the provided credentials are valid or invalid and accordingly provide a response.
    // If they are valid a token will be issued to the user and that will be stored in the database.
    // If not error message will be sent.
    const response = AuthService.logIn(req.body);
  // A server response wll be sent accordingly
    if (response.isSuccess) {
      res.status(201).send("Log In Successful");
    } else {
      res.status(409).send(response.errorMsg);
    }







  });

  // define the logout route
  router.get('/logout', function (req, res) {

    // delete this later when funct is implemented
    res.status(200).send({data: "logging out"});
  });

}