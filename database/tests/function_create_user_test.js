/**
* Tests create user functions on local PostgreSQL database
**/

const add_funs = require("../utils/user_database_utils.js")

/**
* Runs the tests.
**/ 
async function main(){
	//Connect a client to local
	//Assumes you have already set the enviroment variables
	client = []
	try{
		client = await add_funs.connect_client();

		//console.log(client);
		console.log("We have connected.");

	} catch (err){
		console.log("Failed test, threw the following error trying to connect client: " + err);
		process.exit();
	}

	//clear out test user from possible previous run.
	try{
		await add_funs.delete_user(client, 'test_add_user', 'test_add_hash', 'test_add_email@fake.com', 'test_add_salt');
		console.log("Any previous test user from previous runs have been cleared out of the user_info table.")
	} catch (err){
		console.log("Failed test, when trying to remove previous test user, threw the following error: " + err);
		process.exit();
	}

	//Add test user row to the table.
	try{
		const ret_id = await add_funs.new_user(client, 'test_add_user', 'test_add_hash', 'test_add_email@fake.com', 'test_add_salt');
		
		console.log("We added the user with id: " + ret_id);

	} catch (err){
		console.log("Failed test, when trying to add first client, we threw the following error: " + err +
		".\n  Note, if you didn't clear out the dataset since the last test, it will still be there and fail this.");
		process.exit();
	}
	
	console.log("We are done with adding user, now we will see if the user is in the table.");

	//Dump table to make sure that the user was added
	try{
		const success = await add_funs.dump_user_info(client);

		console.log("Able to dump user_info table")
		
	} catch (err){
		console.log("Failed test, when trying to dump table, threw the following error: " + err);
		process.exit();
	}
	
	// Try to add another user with the same info, should reject the request.
	console.log("Now we will test adding the same user, should not work.");
	try{
		const ret_id_2 = await add_funs.new_user(client, 'test_add_user', 'test_add_hash', 'test_add_email@fake.com', 'test_add_salt');

		console.log("Failed test, when adding a duplicate, didn't throw error but instead resolved with id " + ret_id_2);
		process.exit();

	} catch (err){
		console.log("Correctly rejcted the insertion of a duplicate line with the following error message: " + err);
	}

	console.log("---------------All tests passed!-----------------");
	
	//If this is replaced with a return statement, it seems to hang on it and the program never ends.
	process.exit()
}

if (require.main === module) {
	console.log("Starting test");
	main();
}