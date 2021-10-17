import express, { Router } from "express";
import path from "path";
import AuthService from "../services/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DbUtil, {connect_client} from "../../database/utils/user_database_utils";
import bycrpt from "bcrypt";
import tokenAuthorization from "../middleware/tokenAuth";

const router = express.Router();

export default (app) => {
  app.use("/auth", router);

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
      return res.status(201).json({message: "Account successfully created"})
    } catch (err) {
        let errString;
      if(err === "Account info already exists"){
        errString = "Account info already exists";
      }else{
        errString = "DB ERROR #3: " + err;
      }
      client.end();
      console.log(errString);
      return res.status(400).json({message: "An error occured behind the scenes"});
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

  // define the join_room route
  router.post('/joinRoom', async function (req, res) {
    const { email, room_id } = req.body;
    let client;
    let id_array;
    //let row;

    //TODO: validate user's token

    try {
      // connect client
      client = await DbUtil.connect_client();
    } catch (err) {
      const errString = "ENTER ROOM CLIENT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json(errString);
    }

    try{
      // get user_id
      id_array = await DbUtil.get_user_ids_from_fields(client, "email", email)

      if (id_array.length !== 1){
        client.end();
        return res.status(400).json("User trying to enter room doesn't exist.");
      }
    } catch (err) {
      const errString = "ENTER ROOM ERROR #2:" + err
      client.end();
      console.log(errString);
      return res.status(400).json(errString);
    }

    // check if they are currently in a room (this part is not neccesary)
    // try{
    //   row = await DbUtil.select_user_with_id(client, id_array[0]);
    //   if(row.curr_room !== null){ //default value for user not in room
    //     const errString = "ENTER ROOM ERROR: User is already in a room";
    //     client.end();
    //     console.log(errString);
    //     return res.status(400).json(errString);
    //   }
    // } catch (err) {
    //   const errString = "ENTER ROOM CLIENT ERROR #3:" + err
    //   client.end()
    //   console.log(errString);
    //   return res.status(400).json(errString);
    // }

    // add them to the room
    try{
      await DbUtil.set_field_for_user_id(client, id_array[0], "curr_room", room_id);

    } catch (err){
      const errString = "ENTER ROOM CLIENT ERROR #4:" + err
      client.end()
      console.log(errString);
      return res.status(400).json("Unable to add user to this room");
    }

    //TODO: in the future, we will want to check their role in this room and return that in the status as well
    // atm it just returns role 0 (guest)

    client.end();
    return res.status(200).json({role: 0, message:"User added to room " + room_id});

  });

  // handle leaveRoom request
  router.post('/leaveRoom', async function (req, res) {
    const { email } = req.body;
    let client;
    let id_array;
    //let row;

    //TODO: verify session token

    try {
      // connect client
      client = await DbUtil.connect_client();
    } catch (err) {
      const errString = "LEAVE ROOM CLIENT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json(errString);
    }

    try{
      // get user_id
      id_array = await DbUtil.get_user_ids_from_fields(client, "email", email)

      if (id_array.length !== 1){
        client.end();
        return res.status(400).json("User trying to leave room doesn't exist.");
      }
    } catch (err) {
      const errString = "LEAVE ROOM ERROR #2:" + err
      client.end();
      console.log(errString);
      return res.status(400).json(errString);
    }

    // check if they are currently in a room (this part is not neccesary)
    // actually, we might want to remove this part since, if they disconnect, they might get stuck in a room but not in a room
    // try{
    //   row = await DbUtil.select_user_with_id(client, id_array[0]);
    //   if(row.curr_room === null){ //default value for user not in room
    //   const errString = "LEAVE ROOM ERROR: User is not in a room";
    //     client.end();
    //     console.log(errString);
    //     return res.status(400).json(errString);
    //   }
    // } catch (err) {
    //   const errString = "ENTER ROOM CLIENT ERROR #3:" + err
    //   client.end()
    //   console.log(errString);
    //   return res.status(400).json(errString);
    // }

    // remove them from the room
    try{
      await DbUtil.set_field_for_user_id(client, id_array[0], "curr_room", null);

    } catch (err){
      const errString = "ENTER ROOM CLIENT ERROR #4:" + err
        client.end()
        console.log(errString);
        return res.status(400).json("Unable to add user to this room");
    }

    client.end();
    return res.status(200).json("User removed from room");
  });

  // This one doesn't need to validate a login, as it doesn't really matter.
  // Lists all the usernames of people in the given room
  router.post('/listRoom', async function (req, res) {
    const { room_id } = req.body;
    let client;

  try {
      // connect client
      client = await DbUtil.connect_client();
    }catch (err) {
      const errString = "LEAVE ROOM CLIENT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json(errString);
    }

    try{
	  const user_list = await DbUtil.get_rows_in_room(client, room_id, "username");
      //Note: this user_list could be empty
	  console.log("Number of users in room " + room_id + " is " + user_list.length);
	  client.end();
	  return res.status(200).json({user_list: user_list});
    } catch(err){
      console.log("Failed test: Error when trying to retrieve usernames in room" + room_id + ": " + err);
      client.end();
      console.log("Exiting.")
      process.exit();
    }
  });

  // define the logout route
  router.get('/logout', function (req, res) {
    res.status(200).json({message: "logging out"});
  });
}
