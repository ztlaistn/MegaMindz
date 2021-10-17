import express, { Router } from "express";
import path from "path";
import AuthService from "../services/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DbUtil, {connect_client, new_user} from "../../database/utils/user_database_utils";
import bycrpt from "bcrypt";

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
      return res.status(400).json(errString);
    }

    try{
      id_array = await DbUtil.get_user_ids_from_fields(client, "email",email)

      if (id_array.length !== 1){
        client.end()
        return res.status(400).json("Email does not exist");
      }
    }
    catch (err) {
      const errString = "LOGIN CLIENT ERROR #3:" + err
      client.end();
      console.log(errString);
      return res.status(400).json(errString);
    }

    try{
      row = await DbUtil.select_user_with_id(client, id_array[0])
    }
    catch (err) {
      const errString = "LOGIN CLIENT ERROR #4:" + err
      client.end()
      console.log(errString);
      return res.status(400).json(errString);
    }

    try{
      hash = row.hash
      const password_match = (await bycrpt.compare(password, hash))
      console.log(hash)
      console.log(password_match)
      if (password_match){
        let token = jwt.sign(password_match,process.env.TOKEN_SECRET)
        console.log("Logged in user " + row.user_id)
        client.end();
        return res.status(200).json({token: token, message:"Login Successful",username:row.username});
      }else{
        client.end();
        console.log("Could not log in user " + row.user_id)
        return res.status(400).json("Username or password Incorrect");
      }
    }
    catch (err) {
      const errString = "LOGIN CLIENT ERROR #5:" + err
      client.end()
      console.log(errString);
      return res.status(400).json("email does not exist");
    }


  });
  router.post('/fetchUserAccount', async function (req, res) {
    // making sure all login credentials provided
    const {email} = req.body;
    let client;
    let id_array;
    let row;
    try {
      // connect client
      client = await DbUtil.connect_client();
    }
    catch (err) {
      const errString = "USER ACCOUNT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json(errString);
    }
    try{
      id_array = await DbUtil.get_user_ids_from_fields(client, "email",email)

      if (id_array.length !== 1){
        client.end()
        return res.status(400).json("Email does not exist");
      }
    }
    catch (err) {
      const errString = "USER ACCOUNT ERROR #2:" + err
      client.end()
      console.log(errString);
      return res.status(400).json(errString);
    }
    try{
      row = await DbUtil.select_user_with_id(client, id_array[0])
    }
    catch (err) {
      const errString = "USER ACCOUNT ERROR #3:" + err
      client.end()
      console.log(errString);
      return res.status(400).json(errString);
    }
    client.end()
    return res.status(200).json({name:row.name,username:row.username,location:row.location, dob:row.dob,employment:row.employment,skills:row.skills});


  });

  router.post('/setUserAccount', async function (req, res) {
    // making sure all login credentials provided
    //email
    //fields_to_change : array of all the fields that need to be changed
    // new_values: new values of the fields.
    const {email,fields_to_change,new_values} = req.body;

    let client;
    let id_array;
    let row;
    try {
      // connect client
      client = await DbUtil.connect_client();
    }
    catch (err) {
      const errString = "SET USER ACCOUNT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json(errString);
    }
    try{
      id_array = await DbUtil.get_user_ids_from_fields(client, "email",email)

      if (id_array.length !== 1){
        return res.status(400).json("Email does not exist");
      }
    }
    catch (err) {
      const errString = "SET USER ACCOUNT ERROR #2:" + err
      client.end()
      console.log(errString);
      return res.status(400).json(errString);
    }
    try{
        row = await DbUtil.set_field_for_user_id(client, id_array[0],"location",new_values["location"])
      row = await DbUtil.set_field_for_user_id(client, id_array[0],"dob",new_values["dob"])
      row = await DbUtil.set_field_for_user_id(client, id_array[0],"skills",new_values["skills"])
      row = await DbUtil.set_field_for_user_id(client, id_array[0],"status",new_values["status"])
      row = await DbUtil.set_field_for_user_id(client, id_array[0],"full_name",new_values["full_name"])


    }
    catch (err) {
      const errString = "SET USER ACCOUNT ERROR #3:" + err
      client.end()
      console.log(errString);
      return res.status(400).json(errString);
    }
    client.end()
    return res.status(200).json("successfully changed fields");


  });


  // define the logout route
  router.get('/logout', function (req, res) {

    // delete this later when funct is implemented
    res.status(200).send({data: "logging out"});
  });

}
