// File for object that will keep track of the positions of people in a room


// Start positions for the characters when they join the room
START_X = 200
START_Y = 200

class roomPosition{
    // This dict will keep track of the positions of the people in this room
    // The key will be a userId, the value will be an object: 
    //      ({x: something, y: something, username: something, visable: T/F, sprite: some-int})
    // The visable value denotes if they are currently in the room.  This way, we can store players positions even when the leave.
    // The sprite denotes which sprite option the user has choosen to display
    // So that when they join back, they are in the same position
    // The visible field will pretty much never be send back on any of the functions, since it is asssumed to be true if returned for any of them
    pos_dict = {}

    /**
     *  Function handles adding a new player to the position dict
     *  Parameters:
     *      uid:    The userId of the player being added
     *      user:   The username of the player being added
     *      sprite: The sprite option the new user has choosen to display
     *  
     *  Returns:
     *  If they are already in the room, simply returns their current position object (plus userId) and sets their visable to true.
     *  If they are new, returns thier new position object (plus userId) which will be the starting values and username
     *  Position objects that are returned do not contain visable status, since they will always be visable after this.
     */
    newPlayer(uid, user, sprite){
        let temp_pos = this.pos_dict[uid];
        if(temp_pos){
            temp_pos.visable = true;
            temp_pos.sprite = sprite;
            return {userId:uid, x:temp_pos.x, y:temp_pos.y, username:user, sprite:sprite};
        }else{
            const new_pos_obj = {x:START_X, y:START_Y, username:user, visable:true, sprite:sprite};
            this.pos_dict[uid] = new_pos_obj;
            return {userId:uid, x:new_pos_obj.x, y:new_pos_obj.y, username:user, sprite:sprite};
        }
    }

    /**
     *  Updates the position value for a player in the room
     *  Parameters:
     *      uid:            The userId of the player being moved
     *      movementData:   Object with x and y value denoting user's new position
     *  
     *  Returns:
     *  Then returns their new position object + userId (minus the visable & sprite, since they will always be visable if they are moving, and user already know their sprite)
     *  If they are not in the room, or not visable, returns null
     */
    movePlayer(uid, movementData){
        let temp_pos = this.pos_dict[uid];
        if(temp_pos && temp_pos.visable){
            const new_pos_obj = {x:movementData.x, y:movementData.y, username:temp_pos.username, visable:true, sprite:temp_pos.sprite};
            this.pos_dict[uid] = new_pos_obj;
            return {userId:uid, x:new_pos_obj.x, y:new_pos_obj.y, username:temp_pos.username};
        }else{
            return null;
        }
    }  


    /**
     *  Changes visable status for the player in the room. 
     *  Parameters:
     *      uid:        The userId for the player being modified
     *  
     *  Returns:
     *  true after modification if success.
     *  If they didn't have any data in the room, returns false
     */
    leftRoom(uid){
        let temp_pos = this.pos_dict[uid];
        if(temp_pos){
            temp_pos.visable = false;
            return true;
        }else{
            return false;
        }
    }

    /**
     * Returns a list of object with all the visable users in the room.
     * Since they are all visable, will be returned as objects that are just x and y position
     * Also returns the user Id as part of this data.  So the final objects in the list are:
     * {userId, x, y, username}
     */
    returnVisable(){
        let temp_list = [];
        for(let key in this.pos_dict){
            let temp_pos = this.pos_dict[key];
            if (temp_pos.visable){
                temp_list.push({userId:key, x:temp_pos.x, y:temp_pos.y, username:temp_pos.username, sprite:temp_pos.sprite});
            }
        }
        return temp_list;
    }
}

module.exports = {
    roomPosition
}