import express, { Router } from "express";
import path from "path";
import AuthService from "../services/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DbUtil from "../../database/utils/user_database_utils";
import bycrpt from "bcrypt";
import {tokenAuthorization} from "../middleware/tokenAuth";

const router = express.Router();

export default (app) => {
  app.use("/auth", router);

  /* ---------------------------- REGISTER ---------------------------- */
  // register a new user
  router.post('/register', async function (req, res) {
    // ensure all required data is present
    const { username, email, password1, password2 } = req.body;
    if (!(email && username && password1 && password2)) {
      return res.status(400).json({message: "All input is required"});
    }

    if (password1 != password2) {
      return res.status(400).json({message: "Passwords must match"});
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
      return res.status(400).json({message: "An error occured behind the scenes"});
    }
    try {
      // connect client
      client = await DbUtil.connect_client();
    } catch (err) {
      const errString = "CLIENT ERROR #2:" + err
      console.log(errString);
      return res.status(400).json({message: "An error occured behind the scenes"});
    }
    // create user in database using new_user(client, username, hash, email)
    try {
      const id = await DbUtil.new_user(client, username, hash, email);
      console.log("Created account: " + id);
      client.end();
      //console.log("here")
      return res.status(200).json({message: "Account successfully created"})
    } catch (err) {
        let errString;
      if(err === "Account info already exists"){
        errString = "Email or Username already in use for other account";
        client.end();
        console.log(errString);
        return res.status(400).json({message: errString});
      }else{
        errString = "DB ERROR #3: " + err;
        client.end();
        console.log(errString);
        return res.status(400).json({message: "An error occured behind the scenes"});
      }
    }
  });

  /* ---------------------------- LOGIN ---------------------------- */
  // define the login route
  router.post('/login', async function (req, res) {
          // making sure all login credentials provided
          const {email,password} = req.body;
    let client;
    let id_array;
    let hash;
    let row;

    try {
      // connect client
      client = await DbUtil.connect_client();
    }
    catch (err) {
      const errString = "LOGIN CLIENT ERROR #2:" + err
      console.log(errString);
      return res.status(400).json({message: "An error occured behind the scenes"});
    }

    try{
      id_array = await DbUtil.get_user_ids_from_fields(client, "email",email)

      if (id_array.length !== 1){
        return res.status(400).json({message: "Account does not exist"});
      }
    }
    catch (err) {
      const errString = "LOGIN CLIENT ERROR #3:" + err
      client.end();
      console.log(errString);
      return res.status(400).json({message: "An error occured behind the scenes"});
    }

    try{
      row = await DbUtil.select_user_with_id(client, id_array[0])
    }
    catch (err) {
      const errString = "LOGIN CLIENT ERROR #4:" + err
      client.end()
      console.log(errString);
      return res.status(400).json({message: "An error occured behind the scenes"});
    }

    try{
      hash = row.hash
      const password_match = (await bycrpt.compare(password, hash))
      console.log(hash)
      console.log(password_match)
      if (password_match){
        let token = jwt.sign(
            {
                userId: row.user_id
            },
            process.env.TOKEN_SECRET,
            { expiresIn: '2h' });
        console.log("Logged in user " + row.user_id)
        client.end();
        return res
            .status(200)
            .json({
                token: token,
                message: "Login Successful",
                username: row.username
                });
      }else{
        client.end();
        console.log("Could not log in user " + row.user_id)
        return res.status(400).json({message: "Username or password Incorrect"});
      }
    }
    catch (err) {
      const errString = "LOGIN CLIENT ERROR #5:" + err
      client.end()
      console.log(errString);
      return res.status(400).json({message: "email does not exist"});
    }
  });

  /* ---------------------------- FETCH USER ACCOUNT ---------------------------- */
  router.post('/fetchUserAccount', tokenAuthorization,async function (req, res) {
    // making sure all login credentials provided
    const {userId} = req.body;
    let client;

    let row;
    try {
      // connect client
      client = await DbUtil.connect_client();
    }
    catch (err) {
      const errString = "USER ACCOUNT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    try{
      row = await DbUtil.select_user_with_id(client, userId)
    }
    catch (err) {
      const errString = "USER ACCOUNT ERROR #2:" + err
      client.end()
      console.log(errString);
      return res.status(400).json({message: errString});
    }
    client.end()
    return res.status(200).json({
      full_name:row.full_name,
      username:row.username,
      location:row.location, 
      dob:row.dob,
      skills:row.skills,
      status:row.status,
      sprite:row.sprite,
      message:"Returned Fields"
    });

  });


  /* ---------------------------- SET USER ACCOUNT ---------------------------- */
  router.post('/setUserAccount', tokenAuthorization,async function (req, res) {
    // making sure all login credentials provided
    //email
    //fields_to_change : array of all the fields that need to be changed
    // new_values: new values of the fields.
    const {userId,new_values} = req.body;

    let client;

    let row;
    try {
      // connect client
      client = await DbUtil.connect_client();
    }
    catch (err) {
      const errString = "SET USER ACCOUNT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    try{
      row = await DbUtil.set_field_for_user_id(client, userId,"location",new_values["location"])
      row = await DbUtil.set_field_for_user_id(client, userId,"skills",new_values["skills"])
      row = await DbUtil.set_field_for_user_id(client, userId,"status",new_values["status"])
      row = await DbUtil.set_field_for_user_id(client, userId,"full_name",new_values["full_name"])
      row = await DbUtil.set_field_for_user_id(client, userId,"sprite",new_values["sprite"])

      // DOB Set intentionally last.  It is the most likely to fail, due to date restrictions (preventing invalid dates).
      // Therefore, if it fails, we still want to set the other fields.
      row = await DbUtil.set_field_for_user_id(client, userId,"dob",new_values["dob"])

    }
    catch (err) {
      const errString = "SET USER ACCOUNT ERROR #2:" + err
      client.end()
      console.log(errString);
      return res.status(400).json({message: errString});
    }
    client.end()
    return res.status(200).json({message:"successfully changed fields"});


  });

  // define the logout route
  router.get('/logout', function (req, res) {
    res.status(200).json({message: "logging out"});
  });

}
