// tests for room_role_info table functions

const user_funcs = require('../utils/user_database_utils')
const room_role_funcs = require('../utils/room_role_database_utils')

async function main(){

    //conect client
    client = []

    const room1 = 543;
    const owner1 = 10;
    const room2 = 123;
    const owner2 = 112;
    const guest1 = 2;

    // Start by making the client connection
    try{
        client = await user_funcs.connect_client();
        console.log("Client connected.");
    } catch (err){
        console.log("Failed test: threw the following error trying to connect client: " + err);
        client.end();
        console.log("Exiting.");
        process.exit(); 
    }

    //TODO: Remove any rows created from last test with close_room
    try{
        await room_role_funcs.close_room(client, room1);
        await room_role_funcs.close_room(client, room2);
        console.log("Correctly deleted rooms from previous test runs");
    }catch(err){
        console.log("Failed test, rejected when closing rooms: " + err);
        client.end();
        console.log("Exiting");
        process.exit();
    }

    // make a new room with negative code
    try{
        await room_role_funcs.create_new_room(client, owner1, -5);
        console.log("Failed Test: Allowed to create room with negative code");
        client.end();
        console.log("Exiting");
        process.exit();
    }catch (err){
        console.log("Correctly through rejection for negative room add: " + err);
    }

    // make a room with a valid number
    try{
        const ret = await room_role_funcs.create_new_room(client, owner1, room1);
        if(ret === room1){
            console.log("Correctly made room with room number " + ret);
        }else{
            console.log("Failed test, made room but room number changed from passed: " + ret + " expected: " + room1);
            client.end()
            console.log("Exiting");
            process.exit();
        }
    }catch (err){
        console.log("Failed test, rejected when creating valid room: " + err);
        client.end();
        console.log("Exiting");
        process.exit();
    }

    //make the same room again
    try{
        const ret = await room_role_funcs.create_new_room(client, owner1, room1);
        if (ret === -1){
            console.log("Correctly returned -1 when trying to remake the same room");
        }else{
            console.log("Failed Test, allowed to remake room that already exists");
            client.end();
            console.log("Exiting")
            process.exit();
        }
    } catch(err){
        console.log("Failed Test, rejected with error in create_new_room: " + err);
        client.end();
        console.log("Exiting")
        process.exit();
    }

    // check the roll of our owner, in their room
    try{
        const ret = await room_role_funcs.find_user_in_room_roll(client, owner1, room1);
        if(ret.role === room_role_funcs.ROLE_OWNER){
            console.log("Have correct role for owner of room");
        }else{
            console.log("Failed Test, expected role: " + room_role_funcs.ROLE_OWNER + " but got: " + ret.role);
            client.end();
            console.log("Exiting")
            process.exit();
        }
    } catch (err){
        console.log("Failed Test: Threw error when finding user role: " + err);
        client.end();
        console.log("Exiting")
        process.exit();
    }

    // check the role of a user not in the room
    try{
        const ret = await room_role_funcs.find_user_in_room_roll(client, owner1 + 1, room1 + 1);
        if(ret === null){
            console.log("Correctly returned null when user not in room");
        }else{
            console.log("Failed test: expected null but got: " + ret)
            client.end();
            console.log("Exiting");
            process.exit();
        }
    } catch (err){
        console.log("Failed Test: Threw error in find_user_in_room_roll: " + err);
        client.end();
        console.log("Exiting");
        process.exit();
    }

    // add a second room with a second owner
    try{
        const ret = await room_role_funcs.create_new_room(client, owner2, room2);
        if(ret === room2){
            console.log("Correctly made second room, with room number " + ret);
        }else{
            console.log("Failed test, made room but room number changed from passed: " + ret + " expected: " + room1);
            client.end()
            console.log("Exiting");
            process.exit();
        }
    }catch (err){
        console.log("Failed test, rejected when creating valid room (second room): " + err);
        client.end();
        console.log("Exiting");
        process.exit();
    }

    // add a second person to the first room 
    try{
        const ret = await room_role_funcs.set_role(client, guest1, room_role_funcs.ROLE_GUEST, room1);
        if(ret.user_id === guest1 && ret.role === room_role_funcs.ROLE_GUEST && ret.room_code == room1){
            console.log("Correctly added guest role to first room");
        }else{
            console.log("Failed test: incorrect return from set_role on valid role set");
            client.end();
            console.log("Exiting");
            process.exit();
        }
    } catch(err){
        console.log("Failed test, rejected when adding guest role to first room: " + err);
        client.end();
        console.log("Exiting");
        process.exit();
    }

    // update the guests role to something else
    try{
        const ret = await room_role_funcs.set_role(client, guest1, room_role_funcs.ROLE_MODERATOR, room1);
        if(ret.user_id === guest1 && ret.role === room_role_funcs.ROLE_MODERATOR && ret.room_code == room1){
            console.log("Correctly updated guest to first room");
        }else{
            console.log("Failed test: incorrect return from set_role on valid role set update");
            client.end();
            console.log("Exiting");
            process.exit();
        }
    } catch(err){
        console.log("Failed test, rejected when updating guest role to first room: " + err);
        client.end();
        console.log("Exiting");
        process.exit();
    }

    // give the guest a role in the second room
    try{
        const ret = await room_role_funcs.set_role(client, guest1, room_role_funcs.ROLE_GUEST, room2);
        if(ret.user_id === guest1 && ret.role === room_role_funcs.ROLE_GUEST && ret.room_code === room2){
            console.log("Correctly added guest role to second room");
        }else{
            console.log("Failed test: incorrect return from set_role on valid role set");
            client.end();
            console.log("Exiting");
            process.exit();
        }
    } catch(err){
        console.log("Failed test, rejected when adding guest role to second room: " + err);
        client.end();
        console.log("Exiting");
        process.exit();
    }

    // They should still have the role in the first room
    try{
        const ret = await room_role_funcs.find_user_in_room_roll(client, guest1, room1);
        if(ret.role === room_role_funcs.ROLE_MODERATOR){
            console.log("Correctly returned role of guest in first room");
        }else{
            console.log("Failed test: expected " + room_role_funcs.ROLE_MODERATOR + " but got: " + ret.role);
            client.end();
            console.log("Exiting");
            process.exit();
        }
    } catch (err){
        console.log("Failed Test: Threw error in find_user_in_room_roll for valid check of guest in first room: " + err);
        client.end();
        console.log("Exiting");
        process.exit();
    }

    client.end();
    console.log("\n------------------ Passed All Room Role Tests ---------------------- \n")
    process.exit();

}

if (require.main == module){
    console.log("Starting Room Role Tests");
    main();
}