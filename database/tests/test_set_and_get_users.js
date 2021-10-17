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
        await database_funs.delete_user(client, 'test_get_valid_user', 'test_get_valid_hash', 'test_get_valid@fake.com');
        console.log("First previous test user from previous runs have been cleared out of the user_info table.");
    } catch (err){
        console.log("Failed test, when trying to remove previous test user, threw the following error: " + err);
        client.end();
        console.log("Exiting.")
        process.exit(); 
    }


    // Delete second user as well
    try{
        await database_funs.delete_user(client, 'test_get_valid_user2', 'test_get_valid_hash2', 'test_get_valid2@fake.com');
        console.log("Second previous test user from previous runs have been cleared out of the user_info table.");
    } catch (err){
        console.log("Failed test, when trying to remove previous test user, threw the following error: " + err);
        client.end();
        console.log("Exiting.")
        process.exit(); 
    }


    // Add first user back in
    ret_id = -1;
	try{
		ret_id = await database_funs.new_user(client, 'test_get_valid_user', 'test_get_valid_hash', 'test_get_valid@fake.com');
		console.log("We added the user with id: " + ret_id);
	} catch (err){
        console.log("Failed test: when trying to add first client, we threw the following error: " + err +
	    ".\n  Note, if you didn't clear out the dataset since the last test, it will still be there and fail this.");
        client.end();
        console.log("Exiting.")
        process.exit(); 
    }

    // ------------------------- Test Set Function ----------------------------// 

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

    // ------------------------- Test Get Function ----------------------------// 

    // get with an invalid field should throw an error
    try{
        await database_funs.get_user_ids_from_fields(client, "not_real_field", "invalid");
        console.log("Failed test: when trying to get ids with invalid field, didn't throw an error");
        client.end();
        console.log("Exiting.")
        process.exit(); 
    } catch (err){
        console.log("Correctly rejected invalid get field with the following error message: " + err);
    }

    // try a get that should not be able to find any matches (with one field/value combo)
    try{ 
        id_list = await database_funs.get_user_ids_from_fields(client, "username", "user_not_in_table");
        if(id_list.length !== 0){
            console.log("Failed test: returned list of incorrect size from get function with one field/value pair (no matches in table).  Expected 0 element, got: ", + id_list.length);
            client.end();
            console.log("Exiting.")
            process.exit();
        }else{
            console.log("Correctly returned an empty array from get (with one field/value pair), with id: ");
        }
    } catch (err){
        console.log("Failed test: threw the following error when calling get function with one valid field/value pair (not matches in table): " + err);
        client.end();
        console.log("Exiting.")
        process.exit();
    }
    
    // try a get with the user we added before (with one field/value combo)
    try{ 
        id_list = await database_funs.get_user_ids_from_fields(client, "username", "test_get_valid_user");
        if(id_list.length !== 1){
            console.log("Failed test: returned list of incorrect size from get function with one field/value pair.  Expected 1 element, got: ", + id_list.length);
            client.end();
            console.log("Exiting.")
            process.exit();
        }
        else if(id_list[0] !== ret_id){
            console.log("Failed test: element in list from get function (with one field/value pair) has incorrect id.  Expected: " + ret_id + " but got: " + id_list[0]);
            client.end();
            console.log("Exiting.")
            process.exit();
        }else{
            console.log("Correctly returned one item from get (with one field/value pair), with id: " + id_list[0]);
        }
    } catch (err){
        console.log("Failed test: threw the following error when calling get function with one valid field/value pair: " + err);
        client.end();
        console.log("Exiting.")
        process.exit();
    }

    // try the same thing, but supply two valid field/value pairs
    try{ 
        id_list = await database_funs.get_user_ids_from_fields(client, "username", "test_get_valid_user", field2="hash", value="test_get_valid_hash");
        if(id_list.length !== 1){
            console.log("Failed test: returned list of incorrect size from get function with two field/value pairs.  Expected 1 element, got: ", + id_list.length);
            client.end();
            console.log("Exiting.")
            process.exit();
        }
        else if(id_list[0] !== ret_id){
            console.log("Failed test: element in list from get function (with two field/value pairs) has incorrect id.  Expected: " + ret_id + " but got: " + id_list[0]);
            client.end();
            console.log("Exiting.")
            process.exit();
        }else{
            console.log("Correctly returned one item from get (with two field/value pairs), with id: " + id_list[0]);
        }
    } catch (err){
        console.log("Failed test: threw the following error when calling get function with two valid field/value pairs: " + err);
        client.end();
        console.log("Exiting.")
        process.exit();
    }

     // Similar, but should not find anything, due to second pair
     try{ 
        id_list = await database_funs.get_user_ids_from_fields(client, "username", "test_get_valid_user", field2="hash", value="invalid_hash");
        if(id_list.length !== 0){
            console.log("Failed test: returned list of incorrect size from get function with two field/value pairs.  Expected 0 element, got: ", + id_list.length);
            console.log("Contents of list returned: ")
            id_list.forEach(x=>{
                console.log(x)
            });
            client.end();
            console.log("Exiting.")
            process.exit();
        }else{
            console.log("Correctly returned an empty array from get (with two field/value pairs), when the values do not match anything in table.");
        }
    } catch (err){
        console.log("Failed test: threw the following error when calling get function with two valid field/value pairs (nothing matching in table): " + err);
        client.end();
        console.log("Exiting.")
        process.exit();
    }

    // ------------------------------- Combo Advanced Test ------------------------------ //

    //Add another user, set its full_name to the same as the first user, then check if we return both with get

    //Add another user
    second_ret_id = -1;
	try{
		second_ret_id = await database_funs.new_user(client, 'test_get_valid_user2', 'test_get_valid_hash2', 'test_get_valid2@fake.com');
		console.log("We added the second user, with id: " + second_ret_id);
	} catch (err){
        console.log("Failed test: when trying to add second user, we threw the following error: " + err +
	    ".\n  Note, if you didn't clear out the dataset since the last test, it will still be there and fail this.");
        client.end();
        console.log("Exiting.")
        process.exit(); 
    }

    // test get with second user, on a field that doesn't match, should only return one
    try{ 
        id_list = await database_funs.get_user_ids_from_fields(client, "username", "test_get_valid_user");
        if(id_list.length !== 1){
            console.log("Failed test: returned list of incorrect size from get function with one field/value pair (advanced test).  Expected 1 element, got: ", + id_list.length);
            client.end();
            console.log("Exiting.")
            process.exit();
        }
        else if(id_list[0] !== ret_id){
            console.log("Failed test: element in list from get function (with one field/value pair) has incorrect id (advanced test).  Expected: " + ret_id + " but got: " + id_list[0]);
            client.end();
            console.log("Exiting.")
            process.exit();
        }else{
            console.log("Correctly returned one item from get (with one field/value pair, from advanced test), with id: " + id_list[0]);
        }
    } catch (err){
        console.log("Failed test: threw the following error when calling get function with one valid field/value pair (advanced test): " + err);
        client.end();
        console.log("Exiting.")
        process.exit();
    }

    // set second user's full name to the same as the first 
    try{
        const new_id = await database_funs.set_field_for_user_id(client, second_ret_id, "full_name", "Firstname Lastname");
        if(new_id === second_ret_id){
            console.log("Correctly set field for user with uid (advanced test): " +  second_ret_id);
        }else{
            console.log("Failed test: set user returned a uid that is different than the one passed (advanced test).  It returned: " + new_id + " but we expected: " + ret_id)
        }
    } catch (err){
        console.log("Failed test: when trying a valid set user call, failed with the following error message (advanced test): " + err);
        client.end();
        console.log("Exiting.")
        process.exit(); 
    }

    // test get with value that is matching, should return list of two ids 
    try{ 
        id_list = await database_funs.get_user_ids_from_fields(client, "full_name", "Firstname Lastname");
        if(id_list.length !== 2){
            console.log("Failed test: returned list of incorrect size from get function with one field/value pair (advanced test).  Expected 2 element, got: ", + id_list.length);
            client.end();
            console.log("Exiting.")
            process.exit();
        }else{
            if(!id_list.includes(ret_id)){
                console.log("Failed test: returned from get did not include the first added user_id: " + ret_id + ".  The list contents:")
                id_list.forEach(x=>{
                    console.log(x)
                });
                client.end();
                console.log("Exiting.");
                process.exit();
            }
            if(!id_list.includes(second_ret_id)){
                console.log("Failed test: returned from get did not include the first added second user_id: " + second_ret_id + ".  The list contents:")
                id_list.forEach(x=>{
                    console.log(x)
                });
                client.end();
                console.log("Exiting.");
                process.exit();
            }
            console.log("Correctly returned two item from get (with one field/value pair), with id: " + id_list[0] + " and " + id_list[1]);
        }
    } catch (err){
        console.log("Failed test: threw the following error when calling get function with one valid field/value pair: " + err);
        client.end();
        console.log("Exiting.")
        process.exit();
    }

    client.end();

    console.log("------------------ Passed All Login Validation Tests ----------------------");
    process.exit();

}

if (require.main === module) {
	console.log("Starting Login Validation Test");
	main();
}