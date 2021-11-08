/* Functios that will interface with the room_role_info table in our database.
   Can use the same client that was connected for the user_info table.
*/
const {Client} = require('pg');


const ROLE_GUEST        = 0;
const ROLE_VIP          = 1;
const ROLE_MODERATOR    = 2;
const ROLE_OWNER        = 3;


/**
 * Function that will check if a room exists in the database
 * Parameters:
 *   client:    client that has made a connection with the database
 *   room_code:  room number that we are checking for
 * 
 *  Return:     A Promise
 *              - When the room is not found in the table, we resolve with false
 *              - When the room is found in the table, we resolve with true
 *              - When there is an sql error, will reject with an error message
*/
function room_exists(client, room_code){
    select_query = {
        text: 'SELECT COUNT(*) FROM room_role_info WHERE room_code = $1',
        values: [room_code]
    };
    return new Promise((resolve, reject) => client.query(select_query, (err, res) =>{
        if(err){
            reject("Error in room_exists: " + err);
        }else if(res.rows[0].count > 0){
            resolve(true);
        }else{
            resolve(false);
        }
    }));
}

/**
 * Function that will insert a new row into our table, for a new room and its owner.
 * Checks first that the given room number doesn't exist.
 * Parameters:
 *   client:    client that has made a connection with the database
 *   owner_id:  user_id of the owner who is creating the room
 *   room_code:  room number of the room trying to be created (will not create room with negative number)
 *
 *  Return:     A promise.
 *              - When the room_num is unique and the room is created, will resolve with the room_num
 *              - When the room_num is not unique, the row will not be created, and the function will resolve with -1
 *              - When an error is thrown in the SQL query, this function wiil reject with an error message
 *  
 *  Note: Two main ways to make use of this function:
 *      - Have the user input their own room Id and then just give them an error if it is already in use
 *      - Generate a random room id for the user on backend, and just loop on this function until it makes a room and resolves with a non-negative number 
*/
async function create_new_room(client, owner_id, room_code){
    if(room_code < 0){
        return new Promise((resolve, reject) => {
            reject("Negative room number in create_new_room");
        })
    }

    try{
        const in_use = await room_exists(client, room_code);
        if(in_use){
            // room_code is already in use, resolve with a negative and don't make row
            return new Promise((resolve, reject) => {
                resolve(-1);
            });
        }else{
            // room_code is not in use, we can use it to make a new row
            insert_query = {
                text: 'INSERT INTO room_role_info (user_id, room_code, role) VALUES ($1, $2, $3) RETURNING room_code',
                values: [owner_id, room_code, ROLE_OWNER]
            };
            return new Promise((resolve, reject) => client.query(insert_query, (err, res) =>{
                if(err){
                    reject("Error in create_new_room: " + err);
                }else{
                    resolve(res.rows[0].room_code);
                }
            }));
        }
    } catch (err){
        // return the promise with the error message
        return new Promise((resolve, reject) => {
            reject(err);
        });
    }
}


/**
 * Function that will check if a user already has a role in a room, and return the row it if they do.
 * Parameters:
 *  client:     client object connected to the database
 *  user_id:    id of user in question
 *  room_code:  id of room in question
 * 
 * Returns:     A promise
 *              - Reject with an error message for any sql errors
 *              - Reslove with null if they are not found in that room
 *              - Resolve with their row if they are in the room
 */
function find_user_in_room_roll(client, user_id, room_code){
    select_query = {
        text: 'SELECT * FROM room_role_info WHERE user_id = $1 AND room_code = $2',
        values: [user_id, room_code]
    };

    return new Promise((resolve, reject) => client.query(select_query, (err, res)=>{
        if(err){
            reject("Error in find_user_role_in_room: " + err);
        }else if(res.rows.length === 0){
            resolve(null);
        }else{
            resolve(res.rows[0]);
        }
    }))
}


/**
 * Function that will set the user's role in the table.
 * First has to check if the user already has a row in this table
 * Parameters:
 *  client:     connected client object to the database
 *  user_id:    user_id of the user who we are giving a role
 *  role:       role that we are giving to the user
 *  room_code:  room that we are trying to set the user's role in
 * 
 * Return:  A promise
 *          - If there are any sql errors, rejects with error message
 *          - Otherwise, resolves with the row that it changed
 */
async function set_role(client, user_id, role, room_code){
    try{
        const in_table = await find_user_in_room_roll(client, user_id, room_code)        
        if(in_table !== null){
            // already there, just update
            update_query = {
                text: 'UPDATE room_role_info SET role = $1 WHERE user_id = $2 AND room_code = $3 RETURNING *',
                values: [role, user_id, room_code]
            };
            return new Promise((resolve, reject) => client.query(update_query, (err, res) =>{
                if(err){
                    reject("Error in set_role update: " + err);
                }else{
                    resolve(res.rows[0]);
                }
            }));
        }else{
            // not there, make new row
            insert_query = {
                text: 'INSERT INTO room_role_info (user_id, room_code, role) VALUES ($1, $2, $3) RETURNING *',
                values: [user_id, room_code, role]
            };
            return new Promise((resolve, reject) => client.query(insert_query, (err, res) =>{
                if(err){
                    reject("Error in set_role insert: " + err);
                }else{
                    resolve(res.rows[0]);
                }
            }));
        }
    } catch (err){
        return new Promise((resolve, reject) => {
            reject(err);
        })
    }
}


/**
 * Function that will delete all rows in the table that refer to the given room 
 * Parameters:
 *  client:     client object with connection to the database
 *  room_code:  room id that we are deleting the rows for
 * 
 * Return:      A promise
 *              If there was an sql error, will reject with the error message
 *              If not, will resolve with the room_code of the room it deleted the rows for
*/
function close_room(client, room_code){
    delete_query = {
        text: 'DELETE FROM room_role_info WHERE room_code = $1',
        values: [room_code]
    };

    return new Promise((resolve, reject) => client.query(delete_query, (err) =>{
        if(err){
            reject("Error in close_room: " + err);
        }else{
            resolve(room_code);
        }
    }))

}

module.exports = {
    room_exists,
    create_new_room,
    find_user_in_room_roll,
    set_role,
    close_room,
    ROLE_GUEST,
    ROLE_VIP,
    ROLE_MODERATOR,
    ROLE_OWNER
};