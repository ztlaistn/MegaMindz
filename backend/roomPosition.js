// File for object that will keep track of the positions of people in a room


// Start positions for the characters when they join the room
START_X = 10
START_Y = 10

class roomPosition{
    // This dict will keep track of the positions of the people in this room
    // The key will be a userId, the value will be an object holding x and y pos ({x: something, y: something, visable: T/F})
    // The visable value denotes if they are currently in the room.  This way, we can store players positions even when the leave
    // So that when they join back, they are in the same position
    pos_dict = {}

    /**
     *  Function handles adding a new player to the position dict
     *  Parameters:
     *      uid:    The userId of the player being added
     *  
     *  Returns:
     *  If they are already in the room, simply returns their current position and sets their visable to true.
     *  If they are new, returns thier new position which will be the starting values
     *  Position objects that are returned do not contain visable status, since they will always be visable after this.
     */
    newPlayer(uid){
        let temp_pos = this.pos_dict[uid];
        if(temp_pos){
            temp_pos.visable = true;
            return {x:temp_pos.x, y:temp_pos.y};
        }else{
            const new_pos_obj = {x:START_X, y:START_Y, visable:true};
            temp_pos = new_pos_obj;
            return {x:new_pos_obj.x, y:new_pos_obj.y};
        }
    }

    /**
     *  Updates the position value for a player in the room
     *  Parameters:
     *      uid:            The userId of the player being moved
     *      movementData:   Object with x and y value denoting user's new position
     *  
     *  Returns:
     *  Then returns their new position object (minus the visable, since they will always be visable if they are moving)
     *  If they are not in the room, or not visable, returns null
     */
    movePlayer(uid, movementData){
        let temp_pos = this.pos_dict[uid];
        if(temp_pos && temp_pos.visable){
            const new_pos_obj = {x:movementData.x, y:movementData.y, visable:true};
            temp_pos = new_pos_obj;
            return {x:new_pos_obj.x, y:new_pos_obj.y};
        }else{
            console.log("Trying to move player that is not in the room");
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
     * {userId, x, y}
     */
    returnVisable(){
        let temp_list = [];
        for(key in this.pos_dict){
            if (this.pos_dict[key].visable){
                temp_list.push({userId:key, x:this.pos_dict[key].x, y:this.pos_dict[key].y})
            }
        }
        return temp_list;
    }
}

module.exports = {
    roomPosition
}