import express, { Router } from "express";
import DbUtil from "../../database/utils/user_database_utils";
import DbRoll from "../../database/utils/room_role_database_utils";
import {tokenAuthorization, validateToken} from "../middleware/tokenAuth";

const router = express.Router();

export default (app) => {
  app.use("/users", router);

  router.get('/test1', function (req, res) {
    res.send('Users home page')
  });
  // define the about route
  router.get('/test2', function (req, res) {
    res.send('Users birds')
  });

  router.post('/demoteUser', tokenAuthorization, async function (req, res) {
    const { user_Id, roomId, auth } = req.body; //for some strange reason userId is the same as callerId when its named userId
    const callerId = validateToken(auth); //Get userid from the token.
    if (callerId == -1) {
      const errString = "User Not Found From Token"
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    let client;
    try {
      // connect client
      client = await DbUtil.connect_client();
    }catch (err) {
      const errString = "LIST ROOM ADMIN CLIENT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    // make sure the user from the token is moderator or higher in the room, also make sure target is vip. 
    try{
      const roleRow = await DbRoll.find_user_in_room_roll(client, callerId, roomId)
      if (roleRow.role < 2){
        const errString = "LIST ROOM ADMIN ERROR #2: Not authorized for these actions.";
        client.end();
        return res.status(400).json({message: errString});
      }
      const roleRow2 = await DbRoll.find_user_in_room_roll(client, user_Id, roomId)
      if (roleRow2.role >= 2 && roleRow.role != 3){ //room owners can demote mods
        const errString = "LIST ROOM ADMIN ERROR #2: Not authorized to perform that on this user.";
        client.end();
        return res.status(400).json({message: errString});
      }
    } catch (err){
      const errString = "LIST ROOM ADMIN ERROR #3: " + err;
      client.end();
      return res.status(400).json({message: errString});
    }

   

    //promote

    try{
      await DbRoll.set_role(client, user_Id, DbRoll.ROLE_GUEST, roomId);

      const sucString = "Success! That user has been demoted";
      
	    client.end();
	    return res.status(200).json({message: sucString});
    } catch(err){
      const errString = "LIST ROOM CLIENT ERROR #3: " + err;
      client.end();
      return res.status(400).json({message: errString});
    }
  });

  router.post('/makeUserVIP', tokenAuthorization, async function (req, res) {
    const { user_Id, roomId, auth } = req.body; //for some strange reason userId is the same as callerId when its named userId
    const callerId = validateToken(auth); //Get userid from the token.
    if (callerId == -1) {
      const errString = "User Not Found From Token"
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    let client;
    try {
      // connect client
      client = await DbUtil.connect_client();
    }catch (err) {
      const errString = "LIST ROOM ADMIN CLIENT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    // make sure the user from the token is moderator or higher in the room, also make sure that the target is default rank
    try{
      const roleRow = await DbRoll.find_user_in_room_roll(client, callerId, roomId)
      if (roleRow.role < 2){
        const errString = "LIST ROOM ADMIN ERROR #2: Not authorized for these actions.";
        client.end();
        return res.status(400).json({message: errString});
      }
      const roleRow2 = await DbRoll.find_user_in_room_roll(client, user_Id, roomId)
      if (roleRow2.role >= 2 && roleRow.role != 3){ //room owners can demote mods to vip
        const errString = "LIST ROOM ADMIN ERROR #2: Not authorized to perform that on this user.";
        client.end();
        return res.status(400).json({message: errString});
      }
    } catch (err){
      const errString = "LIST ROOM ADMIN ERROR #3: " + err;
      client.end();
      return res.status(400).json({message: errString});
    }

   

    //promote

    try{
      await DbRoll.set_role(client, user_Id, DbRoll.ROLE_VIP, roomId);

      const sucString = "Success! That user has been promoted to VIP";
      
	    client.end();
	    return res.status(200).json({message: sucString});
    } catch(err){
      const errString = "LIST ROOM CLIENT ERROR #3: " + err;
      client.end();
      return res.status(400).json({message: errString});
    }
  });
  

  router.post('/makeUserModerator', tokenAuthorization, async function (req, res) {
    const { user_Id, roomId, auth } = req.body; //for some strange reason userId is the same as callerId when its named userId
    const callerId = validateToken(auth); //Get userid from the token.
    if (callerId == -1) {
      const errString = "User Not Found From Token"
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    let client;
    try {
      // connect client
      client = await DbUtil.connect_client();
    }catch (err) {
      const errString = "LIST ROOM ADMIN CLIENT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    // make sure the user from the token is owner or higher in the room, also make sure that the target is default or vip rank
    try{
      const roleRow = await DbRoll.find_user_in_room_roll(client, callerId, roomId)
      if (roleRow.role < 3){
        const errString = "LIST ROOM ADMIN ERROR #2: Not authorized for these actions.";
        client.end();
        return res.status(400).json({message: errString});
      }
      const roleRow2 = await DbRoll.find_user_in_room_roll(client, user_Id, roomId)
      if (roleRow2.role >= 3){
        const errString = "LIST ROOM ADMIN ERROR #2: Not authorized to perform that on this user.";
        client.end();
        return res.status(400).json({message: errString});
      }
    } catch (err){
      const errString = "LIST ROOM ADMIN ERROR #3: " + err;
      client.end();
      return res.status(400).json({message: errString});
    }

    

    //promote

    try{
      await DbRoll.set_role(client, user_Id, DbRoll.ROLE_MODERATOR, roomId);

      const sucString = "Success! That user has been promoted to Moderator";
      
	    client.end();
	    return res.status(200).json({message: sucString});
    } catch(err){
      const errString = "LIST ROOM CLIENT ERROR #3: " + err;
      client.end();
      return res.status(400).json({message: errString});
    }
  });

  router.post('/banUser', tokenAuthorization, async function (req, res) {
    const { user_Id, roomId, auth } = req.body; //for some strange reason userId is the same as callerId when its named userId
    const callerId = validateToken(auth); //Get userid from the token.
    if (callerId == -1) {
      const errString = "User Not Found From Token"
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    let client;
    try {
      // connect client
      client = await DbUtil.connect_client();
    }catch (err) {
      const errString = "LIST ROOM ADMIN CLIENT ERROR #1:" + err
      console.log(errString);
      return res.status(400).json({message: errString});
    }

    // make sure the user from the token is higher rank than the target to be banned
    try{
      const roleRow = await DbRoll.find_user_in_room_roll(client, callerId, roomId) //role of caller
      const roleRow2 = await DbRoll.find_user_in_room_roll(client, user_Id, roomId) //role of target
      if (roleRow.role <= roleRow2){
        const errString = "LIST ROOM ADMIN ERROR #2: Not authorized for these actions.";
        client.end();
        return res.status(400).json({message: errString});
      }
    } catch (err){
      const errString = "LIST ROOM ADMIN ERROR #3: " + err;
      client.end();
      return res.status(400).json({message: errString});
    }

    

    //banhammer

    try{
      await DbRoll.set_role(client, user_Id, DbRoll.ROLE_BANNED, roomId);

      const sucString = "Success! That user has been banned from this room";
      
	    client.end();
	    return res.status(200).json({message: sucString});
    } catch(err){
      const errString = "LIST ROOM CLIENT ERROR #3: " + err;
      client.end();
      return res.status(400).json({message: errString});
    }
  });

}
