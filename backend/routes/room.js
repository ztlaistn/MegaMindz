import express, { Router } from "express";
import DbUtil from "../../database/utils/user_database_utils";
import DbRoll from "../../database/utils/room_role_database_utils";
import tokenAuthorization from "../middleware/tokenAuth";

const router = express.Router();

// highest room number possibe (exclusive so this number is not actually possible)
const ROOM_NUM_UPPER_BOUND = 10000

export default (app) => {
  app.use("/room", router);
  
  /* ---------------------------- LIST ROOM ---------------------------- */
  // Lists all the usernames of people in the given room
  // This one doesn't need to validate a login, as it doesn't really matter.
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


  /* ---------------------------- CREATE ROOM ---------------------------- */
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

    /* When this returns, we expect the user to call connect and join on our socket conenction for this room.
      They will have to pass their token so that we can look them up, and verify that they are in that room.
      Then they will be calling our socket function whenever they want to send a message.
      This will also require the token.
      */

    // if all else passed and we got here, return to frontend
    client.end();
    return res.status(200).json({role: DbRoll.ROLE_OWNER, room_id: create_room_return, message:"User created room " + create_room_return});
  });

  
  /* ---------------------------- JOIN ROOM ---------------------------- */
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
        await DbRoll.set_role(client, userId, DbRoll.ROLE_GUEST, room_id);
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
    
    /* When this returns, we expect the user to call connect and join on our socket conenction for this room.
       They will have to pass their token so that we can look them up, and verify that they are in that room.
       Then they will be calling our socket function whenever they want to send a message.
       This will also require the token.
       */

    client.end();
    return res.status(200).json({role: our_role, message:"User added to room " + room_id});
  });


  /* ---------------------------- LEAVE ROOM ---------------------------- */
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

    // remove them from the room
    try{
      await DbUtil.set_field_for_user_id(client, userId, "curr_room", null);

    } catch (err){
      const errString = "ENTER ROOM CLIENT ERROR #2:" + err
        client.end()
        console.log(errString);
        return res.status(400).json({message:"Unable to add user to this room"});
    }

    // TODO: For our socket connection, this will be turned into a function and inserted into the disconnect call, rather than being an endpoint

    client.end();
    return res.status(200).json({message: "User removed from room"});
  });

}