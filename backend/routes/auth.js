import express, { Router } from "express";
import path from "path";
import AuthService from "../services/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DbUtil from "../../database/utils/user_database_utils";

const router = express.Router();

export default (app) => {
  app.use("/auth", router);

  // register a new user
  router.post('/register', async function (req, res) {
    // ensure all required data is present
    const { username, email, password1, password2 } = req.body;
    if (!(email && username && password1 && password2)) {
      return res.status(400).json("All input is required");
    }

    if (password1 != password2) {
      return res.status(400).json("Passwords must match");
    }
    let client;
    let hash;
    try {
      const salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(password1, salt);
      //console.log(salt, hash);
    } catch(err) {
      const errString = "BCRYPT ERROR #1:" + err;
      console.log(errString);
      return res.status(400).json(errString);
    }
    try {
      // connect client
      client = await DbUtil.connect_client();
    } catch (err) {
      const errString = "CLIENT ERROR #2:" + err
      console.log(errString);
      return res.status(400).json(errString);
    }
    // create user in database using new_user(client, username, hash, email)
    try {
      const id = await DbUtil.new_user(client, username, hash, email);
      console.log("Created account: " + id);
      client.end();
      //console.log("here")
      return res.status(201).json("Account successfully created")
    } catch (err) {
        let errString;
      if(err === "Account info already exists"){
        errString = "Account info already exists";
      }else{
        errString = "DB ERROR #3: " + err;
      }
      client.end();
      console.log(errString);
      return res.status(400).json(errString);
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
