// This file is for functions that refer to rooms, but are not strictly routes
const DbUtil = require("../database/utils/user_database_utils");
const DbRoll = require("../database/utils/room_role_database_utils");
const {tokenAuthorization} =  require("./middleware/tokenAuth");

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

module.exports = {
    handleLeaveRoom
};