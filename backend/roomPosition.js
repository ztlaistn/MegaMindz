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
     */
    newPlayer(uid){
        const temp_pos = this.pos_dict[uid];
        if(temp_pos){
            temp_pos.visable = true;
            return temp_pos;
        }else{
            const new_pos_obj = {x:START_X, y:START_Y, visable:true};
            temp_pos = new_pos_obj;
            return new_pos_obj;
        }
    }

    /**
     *  Updates the position value for a player in the room
     *  Parameters:
     *      uid:    The userId of the player being moved
     *      new_x:  Their new x value
     *      new_y:  Their new y value
     *  
     *  Returns:
     *  Then returns their new position object
     *  If they are not in the room, returns null
     */
    movePlayer(uid, new_x, new_y){
        const temp_pos = this.pos_dict[uid];
        if(temp_pos){
            const new_pos_obj = {x:new_x, y:new_y, visable:true};
            temp_pos = new_pos_obj;
            return new_pos_obj;
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
     *  Their position object after modification if success.
     *  If they didn't have any data in the room, returns null
     */
    leftRoom(uid){
        const temp_pos = this.pos_dict[uid];
        if(temp_pos){
            temp_pos.visable = false;
            return temp_pos;
        }else{
            return null;
        }
    }

    /**
     * Returns a list of object with all the visable users in the room
     */
    returnVisable(){
        let temp_list = [];
        for(key in this.pos_dict){
            if (this.pos_dict[key].visable){
                temp_list.push(this.pos_dict[key])
            }
        }
        return temp_list;
    }
}

module.exports = {
    roomPosition
}