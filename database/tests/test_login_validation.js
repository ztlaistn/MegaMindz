/*
* Tests the login validation functions for the database.
*/

//import {strict as assert} from 'assert';
const {fail} = require('assert');
const database_funs = require("../utils/user_database_utils.js");

async function main() {
    client = []

    // Start by making the client connection
    try{
        client = await database_funs.connect_client();
        console.log("Client connected.")
    } catch (err){
        fail("Failed test: threw the following error trying to connect client: " + err);
    }

    // Delete our test user from any previous test runs
    try{
        await database_funs.delete_user(client, 'test_login_valid_user', 'test_login_valid_hash', 'test_login_valid@fake.com', 'test_login_valid_first', 'test_login_valid_last', 'test_login_valid_salt');
        console.log("Any previous test user from previous runs have been cleared out of the user_info table.")
    } catch (err){
        fail("Failed test, when trying to remove previous test user, threw the following error: " + err)
    }

    // Try to vailidate a login with a user that doesn't exist, should reject
    try{
        await database_funs.login_validation(client, "test_login_valid@fake.com", "test_login_valid_hash");
        fail("Failed test: approved an invalid login.")
    } catch (err){
        console.log("Correctly rejcted invalid login with the following error message: " + err);
    }

    // Add user back in
    ret_id = -1;
	try{
		ret_id = await database_funs.new_user(client, 'test_login_valid_user', 'test_login_valid_hash', 'test_login_valid@fake.com', 'test_login_valid_first', 'test_login_valid_last', 'test_login_valid_salt');
		console.log("We added the user with id: " + ret_id);
	} catch (err){
        fail("Failed test: when trying to add first client, we threw the following error: " + err +
	    ".\n  Note, if you didn't clear out the dataset since the last test, it will still be there and fail this.")
	}

    // Try to find that user based on it's ID
    try{
		row = await database_funs.select_user_with_id(client, ret_id);
		console.log("Found user with " + ret_id + ": \n" + JSON.stringify(row, null, 2));
	} catch (err){
        fail("Failed test: could not find user that was just added, by its ID.  Error: " + err);
	}

    // Try to validate again, should pass
    try{
        await database_funs.login_validation(client, "test_login_valid@fake.com", "test_login_valid_hash");
        console.log("Correctly validated login");
    } catch (err){
        fail("Failed test: didn't approve valid login validation.  Error: " + err);
    }

    client.end(()=>console.log("exited"));

    console.log("------------------ Passed All Login Validation Tests ----------------------");

}

if (require.main === module) {
	console.log("Starting Login Validation Test");
	main();
}

