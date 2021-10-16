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

    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password1, salt);
      console.log(salt, hash);
      // connect client
      const client = await DbUtil.connect_client();
    } catch (err) {
      console.log(err);
      return res.status(400).json("CLIENT ERROR #1:" + err);
    }
    // create user in database using new_user(client, username, hash, email)
    try {
      const id = await DbUtil.new_user(client, username, hash, email);
      console.log("Created account: " + id);
      client.end();
      return res.status(201).json("Account successfully created")
    } catch (err) {
      client.end();
      return res.status(400).json("DB ERROR: " + err);
      console.log(err);
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
