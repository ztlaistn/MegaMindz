/*
* Tests the database set and get funtions.
* Set function: takes a uid and a field/value combo -> sets that field for the given user
* Get function: takes up to two field/value combos -> returns a list of uids where those conditions where satisfied.
*/

//const {fail} = require('assert');
const database_funs = require("../utils/user_database_utils.js");


async function main() {
    client = []

    // Start by making the client connection
    try{
        client = await database_funs.connect_client();
        console.log("Client connected.");
    } catch (err){
        console.log("Failed test: threw the following error trying to connect client: " + err);
        client.end();
        console.log("Exiting.")
        process.exit(); 
    }

    // Delete our test user from any previous test runs
    try{
        await database_funs.delete_user(client, 'test_get_valid_user', 'test_get_valid_hash', 'test_get_valid@fake.com', 'test_get_valid_salt');
        console.log("Any previous test user from previous runs have been cleared out of the user_info table.");
    } catch (err){
        console.log("Failed test, when trying to remove previous test user, threw the following error: " + err);
        client.end();
        console.log("Exiting.")
        process.exit(); 
    }

    // Add user back in
    ret_id = -1;
	try{
		ret_id = await database_funs.new_user(client, 'test_get_valid_user', 'test_get_valid_hash', 'test_get_valid@fake.com', 'test_get_valid_salt');
		console.log("We added the user with id: " + ret_id);
	} catch (err){
        console.log("Failed test: when trying to add first client, we threw the following error: " + err +
	    ".\n  Note, if you didn't clear out the dataset since the last test, it will still be there and fail this.");
        client.end();
        console.log("Exiting.")
        process.exit(); 
	}

    //test set with an invalid field, should reject
    try{
        await database_funs.set_field_for_user_id(client, ret_id, "fake_col", "25");
        console.log("Failed test: when trying to set a user's field with an invalid field, it was not rejected");
        client.end();
        console.log("Exiting.")
        process.exit(); 
    } catch (err){
		console.log("Correctly rejected invalid field set, with the following error message: " + err);
    }

    //test set with an invalid value, should reject
    try{
        await database_funs.set_field_for_user_id(client, ret_id, "curr_room", "This is not a number");
        console.log("Failed test: when trying to set a user's field with an invalid value, it was not rejected");
        client.end();
        console.log("Exiting.")
        process.exit(); 
    } catch (err){
        console.log("Correctly rejected invalid value set, with the following error message: " + err);
    }

    //test set with an new uid value, should reject
    try{
        await database_funs.set_field_for_user_id(client, ret_id, "User_Id", 24); //intentionally not lower case to test lowercase function is working as intended as well
        console.log("Failed test: when trying to set a user's user_id, it was not rejected");
        client.end();
        console.log("Exiting.")
        process.exit(); 
    } catch (err){
        console.log("Correctly rejected attempt to set user_id, with the following error message: " + err);
    }

    //test set with an invalid uid
    try{
        await database_funs.set_field_for_user_id(client, -1, "username", "test");
        console.log("Failed test: when trying to set a user's field with an invalid user_id, it was not rejected");
        client.end();
        console.log("Exiting.")
        process.exit(); 
    } catch (err){
        console.log("Correctly rejected invalid user_id passed to set, with the following error message: " + err);
    }

    //test set with an valid set call
    try{
        const new_id = await database_funs.set_field_for_user_id(client, ret_id, "full_name", "Firstname Lastname");
        if(new_id === ret_id){
            console.log("Correctly set field for user with uid: " +  ret_id);
        }else{
            console.log("Failed test: set user returned a uid that is different than the one passed.  It returned: " + new_id + " but we expected: " + ret_id)
        }
    } catch (err){
        console.log("Failed test: when trying a valid set user call, failed with the following error message: " + err);
        client.end();
        console.log("Exiting.")
        process.exit(); 
    }

    //TODO: test get function


    client.end();

    console.log("------------------ Passed All Login Validation Tests ----------------------");
    process.exit();

}

if (require.main === module) {
	console.log("Starting Login Validation Test");
	main();
}