// This file is for functions that refer to rooms, but are not strictly routes
// This includes things relating the the sockets for those rooms
const DbUtil = require("../database/utils/user_database_utils");
const DbRoll = require("../database/utils/room_role_database_utils");
const {tokenAuthorization, validateSocketToken} =  require("./middleware/tokenAuth");
const {roomPosition} = require("./roomPosition");


/*
* Function that will handle DB issues regarding leaving a room.
* Very similar to the /leaveRoom backend route
* Parameters:
*   client: client object connected to the database (will not close the client)
*   userId: user_id DB value for the user trying to leave a room
*
* Returns:    A Promise which wiil
*             Resolve with userId when a user leaves a room correctly
*             Reject with error message if there is any error
*/
async function handleLeaveRoom(client, userId) {
    // remove them from the room
    try{
        await DbUtil.set_field_for_user_id(client, userId, "curr_room", null);
        return new Promise((resolve, reject) => {
            resolve(userId);
        });
    } catch (err){
        const errString = "LEAVE ROOM CLIENT ERROR #2:" + err
        console.log(errString);
        return new Promise((resolve, reject)=>{
            reject(errString);
        });
    }
}


/**
 * Function that will handle passing a new message through a room (using io emits)
 * Will use socket emits if there are any errors
 * Parameters:
 *   io:            The io the event is on
 *   socket:        The socket the event is on
 *   ourUserID:     The userId stored in the io connection
 *   ourRoomId:     The room number stored in the io connection
 *   ourUsername:   The username stored in the io connection
 *   auth:          Authorization string (with token)
 *   msg:           Message the user is trying to send
 * 
 * Returns:         Boolean - True if worked, false if error
 */
function newChatMessageEvent(io, socket, ourUserId, ourRoomId, ourUsername, auth, msg){
    // start by checking the userId and roomId are set (user has connected)
    if(ourRoomId < 0 || ourUserId < 0){
        socket.emit('error', {message:"SOCKET NEW-MESSAGE ERROR #1: User trying to relay message when they are not connected to a room."});
    }else{
        const tokenUID = validateSocketToken(auth);
        if (tokenUID < 0 || tokenUID !== ourUserId){
            console.log(ourUserId + " not equal to " + tokenUID)
            const errString = "SOCKET NEW-MESSAGE ERROR #2: Access Denied";
            console.log(errString);
            socket.emit('error', {message:errString});
        }else{
            // broadcast message for our room
            console.log("Users: ", ourUsername + " is sending: " + msg + " for room: " + ourRoomId);
            const sendStr = `${ourUsername}:  ${msg}`;
            io.to(ourRoomId.toString()).emit("new-message", {message: sendStr})
        }
    }
}

/**
 *  Function that handles the disonnecting of the socket.
 *  Parameters:
 *      io:          io object the socket was connected to 
 *      socket:      socket object the event is on
 *      ourUserId:   UserId of user disconnecting
 *      OurRoomId:   RoomId user is disconnecting from
 *      OurUsername: Username of user trying to disconnect
 *  
 * Returns:         A Promise which will
 *                  Resolve upon a successfull disconnect
 *                  Reject with an error message upon a failed disonnect
 */
async function socketDisconnectEvent(io, socket, ourUserId, ourRoomId, ourUsername){
    // start by checking the userId and roomId are set (user has connected)
    console.log("trying to disconnect")
    if(ourRoomId < 0 || ourUserId < 0){
        const errString = "SOCKET DISCONNECT ERROR #1: User must connect before disconnecting.";
        return new Promise((resolve, reject) =>{
            reject(errString);
        });
    }else{
        // TODO: Want to use token validation to ensure that a user cannot close a connection for someone else,
        //       But worried that this might prevent someone with an expired token from disconnecting.
        //       Can we force someone to disconnect as their token expires?

        // make db connection and remove the user from the room
        let socClient;
        try{
            socClient = await DbUtil.connect_client();
        } catch (err){
            const errString = "SOCKET DISCONNECT ERROR #2: " + err;
            return new Promise((resolve, reject) =>{
                reject(errString);
            });
        }

        // make db changes based on the disconnect and try to send out the endStr to the other users in the room.
        try{
            await handleLeaveRoom(socClient, ourUserId);
            socClient.end();
            const endStr = `${ourUsername} has disconnected`;
            console.log(endStr);
            io.to(ourRoomId.toString()).emit("new-message",{message:endStr})
            socket.removeAllListeners();
            return new Promise((resolve, reject) =>{
                resolve();
            })
        } catch (err){
            socClient.end();
            const errString = "SOCKET DISCONNECT ERROR #3: " + err;
            return new Promise((resolve, reject) =>{
                reject(errString);
            });
        }
    }
}


/**
 *  Function that handles connecting a new user to the chat sockets for their given room.
 *  Parameters:
 *      io:         io object the socket is connected on
 *      socket:     socket that the new-user event was on, will be joined into the room on success
 *      auth:       Authorization string, with token
 *      roomId:     Room the user is trying to connect the socket to.
 * 
 *  Returns:        A Promise that will
 *                  On success, resolve with the following data to be set for the connection on return {userId, username, roomId}
 *                  On failure, reject with an error message
 */
async function handleNewChatSocketUser(io, socket, auth, roomId){
    let socClient = null;

    const tokenUID = validateSocketToken(auth);
    if (tokenUID < 0){
        const errString = "SOCKET NEW-USER ERROR #0: Access Denied";
        return new Promise((resolve, reject) => {
            reject(errString);
        });
    }else{
        // connect a client to the database
        try{
            socClient = await DbUtil.connect_client()
        } catch (err){
            const errString = "SOCKET NEW-USER ERROR #1: Couldn't connect to database: " + err;
            return new Promise((resolve, reject) => {
                reject(errString);
            });
        }
    }

    // we connected, check that the room exists
    try{
        const flag = await DbRoll.room_exists(socClient, roomId);
        if(flag){
            const row = await DbUtil.select_user_with_id(socClient, tokenUID);
            socClient.end();
            if(row.curr_room === roomId){
                // Everything was correct, set the variables and connect them to the room
                console.log(`${row.username} has connected to room ${roomId}`);
                socket.join(roomId.toString());
                io.to(roomId.toString()).emit('new-message', {message:`${row.username} has connected`});
                
                // everything worked, resolve with our data to be set on return
                return new Promise((resolve, reject) => {
                    resolve({userId: tokenUID, username: row.username, roomId: roomId});
                });
            }else{
                socClient.end()
                let errString = "SOCKET NEW-USER ERROR #2: User trying to connect to socket for room they are not in.";
                errString = errString + "\nGot :" + row.curr_room + " but expecte: " + roomId;
                return new Promise((resolve, reject) => {
                    reject(errString);
                });
            }
        }else{
            socClient.end()
            const errString = "SOCKET NEW-USER ERROR #3: User trying to connect to socket for room that doesn't exist.";
            return new Promise((resolve, reject) => {
                reject(errString);
            });
        }
    } catch (err){
        socClient.end()
        const errString = "SOCKET NEW-USER ERROR #4: DB Error: " + err;
        return new Promise((resolve, reject) => {
            reject(errString);
        });
    }
}


/**
 * Function handles adding a new user too the room position dict.
 * Will also handle any socket emits needed for this, including errors.
 * This function also assumes they have been connected to the text chat socket already,
 * This means that this function will not do error checking regarding if the user is actually in the room,
 * since this is expected of the text chat socet funtion.
 * 
 * Parameters:
 *      io:         io object for this connection
 *      socket:     socket the user has connected on 
 *      roomId:     room number that the user has joined
 *      userId:     User Id of ther user that is joining
 *      username:   username of the user that has joined
 *      posDict:    position dictionary object for the server
 */
function newUserRoomPosition(io, socket, roomId, userId, username, posDict){
    if(posDict[roomId]){
        console.log("UserId: " + userId + " adding position to room " + roomId);
        const pos_obj = posDict[roomId].newPlayer(ourUserId);
        const out_pos_obj = {x:pos_obj.x, y:pos_obj.y}

        //TODO: change the name of the evenet once we coordinate with frontend
        //TODO: might want to change pos_obj so that it isn't storing the userId, or maybe its time to stop caring about giving the user the ID
        //TODO: in the future, we will want to look up that user in the database and send their avatar selection as well
        
        // Note: This is a socket emit since we want the message to not go back to the sender.
        // This is because we will have an update all event made for them.
        socket.to(roomId.toString()).emit('new-charater-event', out_pos_obj)
        socket.emit('update-all-positions', posDict[roomId].returnVisable())
    }else{
        // This is the first person to join this room 
        console.log("UserId: " + userId + " first person to add position to room " + roomId);

        posDict[roomId] = new roomPosition();
        const pos_obj = posDict[roomId].newPlayer(userId);

        //TODO: change the name of the evenet once we coordinate with frontend
        //TODO: might want to change pos_obj so that it isn't storing the userId, or maybe its time to stop caring about giving the user the ID
        //TODO: in the future, we will want to look up that user in the database and send their avatar selection as well
        
        // Note: This is a socket emit since we want the message to not go back to the sender.
        // This is because we will have an update all event made for them.
        socket.to(roomId.toString()).emit('new-charater-event', pos_obj)
        socket.emit('update-all-positions', posDict[roomId].returnVisable())
    }
}


/**
 * Function that will handle relaying a movement update to all other users in the room
 * Parameters:
 *      io:             io object the client connected on 
 *      socket:         socket object they are sending the movement over
 *      ourRoomId:      the room they are broadcasting their send to 
 *      ourUsername:    the username of the sender
 *      positionDict:   the server position dict keeping track of player locations
 *      movementData:   Object with x and y value denoting user's new position
 */
function relayPositionMove(io, socket, ourRoomId, ourUserID, ourUsername, positionDict, movementData, auth){
    // start by checking the userId and roomId are set (user has connected)
    if(ourRoomId < 0 || ourUserId < 0){
        socket.emit('error', {message:"SOCKET NEW-MOVE ERROR #1: User trying to relay movement data when they are not connected to a room."});
    }else if(!movementData || !(+movementData.x) || !(+movementData.y)){
        socket.emit('error', {message:"SOCKET NEW-MOVE ERROR #2: Impropper move data sent.  Should be obj with x and y value."})
    }else{
        // Make sure they are who they claim to be 
        const tokenUID = validateSocketToken(auth);
        if (tokenUID < 0 || tokenUID !== ourUserId){
            console.log(ourUserId + " not equal to " + tokenUID + " in new move")
            const errString = "SOCKET NEW-MOVE ERROR #3: Access Denied";
            console.log(errString);
            socket.emit('error', {message:errString});
        }else{
            // update this move in the position dict
            positionDict[ourRoomId].movePlayer(ourUserID, movementData)

            // broadcast message for our room, not back to the sender though
            socket.to(ourRoomId.toString()).emit("new-move", movementData)
        }    
    }


module.exports = {
    handleLeaveRoom,
    newChatMessageEvent,
    socketDisconnectEvent,
    handleNewChatSocketUser,
    newUserRoomPosition
};