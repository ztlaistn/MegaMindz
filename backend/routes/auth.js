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
      return res.status(400).json("All input is required");
    }

    const response = AuthService.register(req.body);

    if (response.isSuccess) {
      return res.status(201).json("Account successfully created");
    } else {
      return res.status(409).json(response.errorMsg);
    }
  });

  // define the login route
  router.post('/login', function (req, res) {

  });

  // define the logout route
  router.get('/logout', function (req, res) {

    // delete this later when funct is implemented
    res.status(200).send({data: "logging out"});
  });

}
