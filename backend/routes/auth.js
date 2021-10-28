import express, { Router } from "express";
import path from "path";
import AuthService from "../services/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import DbUtil from "../../database/utils/user_database_utils";
import DbRoll from "../../database/utils/room_role_database_utils";
import bycrpt from "bcrypt";
import tokenAuthorization from "../middleware/tokenAuth";

const router = express.Router();

// highest room number possibe (exclusive so this number is not actually possible)
const ROOM_NUM_UPPER_BOUND = 10000

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
      return res.status(200).json({message: "Account successfully created"})
    } catch (err) {
        let errString;
      if(err === "Account info already exists"){
        errString = "Email already in use for other account";
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
      message:"Returned Fields"
    });

  });

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


  // define the join_room route
  router.post('/joinRoom', tokenAuthorization, async function (req, res) {
    const { room_id, userId } = req.body;
    let client;
    //let row;

    try {
      // connect client
      client = await DbUtil.connect_client();
    } catch (err) {
      const errString = "ENTER ROOM CLIENT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    // UserID obtained by token authentication

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

    // make sure the room exists on the role table
    try{
      const exists = await DbRoll.room_exists(client, room_id);
      if(!exists){
        const errString = "ENTER ROOM CLIENT ERROR #2:" + err
        client.end()
        console.log(errString);
        return res.status(400).json({message: "No room exists with that room code."});
      }
    } catch (err){
      const errString = "ENTER ROOM CLIENT ERROR #3:" + err
      client.end()
      console.log(errString);
      return res.status(400).json({message: "Unable to add user to this room."});
    }

    // by default, they are a guest
    let our_role = DbRoll.ROLE_GUEST;
    let set_role_flag = false;

    // see if user already has a role in that room
    try{
      const row = await DbRoll.find_user_in_room_roll(client, userId, room_id);
      if (row !== null){
        our_role = row.role;
        set_role_flag = true;
      }
    } catch (err){
      const errString = "ENTER ROOM CLIENT ERROR #4:" + err;
      console.log("Unable to get user "+ userId + "'s role in room "+ room_id + ", setting it to guest. Err: " + errString)
    }

    // if we didn't have a role for the user, make an entry as a guest.
    if(!set_role_flag){
      try{
        await DbRoll.set_role(client, user_id, DbRoll.ROLE_GUEST, room_id);
      } catch (err){
        const errString = "ENTER ROOM CLIENT ERROR #5:" + err;
        console.log("Unable to make " + userId + " guest in room " + room_id + ". Err: " + errString);
        return res.status(400).json({message: "Unable to find/give user role in this room."});
      }
    }

    // add them to the room
    try{
      await DbUtil.set_field_for_user_id(client, userId, "curr_room", room_id);

    } catch (err){
      const errString = "ENTER ROOM CLIENT ERROR #6:" + err
      client.end()
      console.log(errString);
      return res.status(400).json({message: "Unable to add user to this room."});
    }
    
    /* -- TODO: Connect user to this room's chat socket connection -- */

    client.end();
    return res.status(200).json({role: our_role, message:"User added to room " + room_id});
  });


  // handle leaveRoom request
  router.post('/leaveRoom', tokenAuthorization, async function (req, res) {
    const { userId } = req.body;
    let client;
    //let row;

    try {
      // connect client
      client = await DbUtil.connect_client();
    } catch (err) {
      const errString = "LEAVE ROOM CLIENT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    // token will get the userId

    // TODO: close their chat socket connection, in later task
    // check if we are the host and close the connection for everyone
    // and also delete the rows in the room_role_info table for that room 

    // remove them from the room
    try{
      await DbUtil.set_field_for_user_id(client, userId, "curr_room", null);

    } catch (err){
      const errString = "ENTER ROOM CLIENT ERROR #2:" + err
        client.end()
        console.log(errString);
        return res.status(400).json({message:"Unable to add user to this room"});
    }

    client.end();
    return res.status(200).json({message: "User removed from room"});
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
      const errString = "LIST ROOM CLIENT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    try{
	  const user_list = await DbUtil.get_rows_in_room(client, room_id, "username");
      //Note: this user_list could be empty
	  console.log("Number of users in room " + room_id + " is " + user_list.length);
	  client.end();
	  return res.status(200).json({user_list: user_list});
    } catch(err){
      const errString = "LIST ROOM CLIENT ERROR #2: " + err;
      client.end();
      return res.status(400).json({message: errString});
    }
  });

  // define the logout route
  router.get('/logout', function (req, res) {
    res.status(200).json({message: "logging out"});
  });

  // handle createRoom requests
  router.post('/createRoom', tokenAuthorization, async function (req, res) {
    const { userId } = req.body;
    let client;
    
    try {
      // connect client
      client = await DbUtil.connect_client();
    }catch (err) {
      const errString = "CREATE ROOM CLIENT ERROR #1:" + err;
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    // generate a room with a random [0-10000) room number
    let create_room_return = -1;
    let failsafe = 0;
    do {
      try{
        let rand_room = Math.floor(Math.random() * ROOM_NUM_UPPER_BOUND);
        create_room_return = await DbRoll.create_new_room(client, userId, rand_room);
        failsafe += 1
      } catch (err){
        const errString = "CREATE ROOM CLIENT ERROR #2:" + err;
        console.log(errString);
        client.end();
        return res.status(400).json({message: errString});
      }
    } while (create_room_return < 0 && failsafe < 50);

    // make sure we actually created the room
    if (create_room_return < 0){
      const errString = "CREATE ROOM CLIENT ERROR #3:" + " Room not created.";
      console.log(errString);
      client.end();
      return res.status(400).json({message: errString});
    }

    //TODO: setup socket connection for this new room

    // add the user to the room
    try{
      await DbUtil.set_field_for_user_id(client, userId, "curr_room", create_room_return);

    } catch (err){
      const errString = "CREATE ROOM CLIENT ERROR #4:" + err
      // since we could not add the room, delete it's entry from the room role table
      try{
        await DbRoll.close_room(client, create_room_return);
        client.end()
        console.log(errString);
        return res.status(400).json({message: "Unable to add user to room just created."});
      } catch (err){
        client.end()
        console.log(errString);
        console.log("Was not able to add user to room in user_info table, or delete the room from the role table.  May be some underlying database problems.");
        return res.status(400).json({message: "Unable to add user to room just created."});
      }
    }

    // if all else passed and we got here, return to frontend
    client.end();
    return res.status(200).json({role: DbRoll.ROLE_OWNER, room_id: create_room_return, message:"User created room " + create_room_return});

  });

}
