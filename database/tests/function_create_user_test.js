/**
* Tests create user functions on local PostgreSQL database
**/

const {Pool, Client} = require('pg');
const add_funs = require("../utils/user_database_utils.js")

/**
* Runs the tests.
**/ 
async function main(){
	console.log("Starting inside main.")

	//Connect a client to local
	//Assumes you have set the enviroment variables
	const client = await add_funs.connect_client();
	
	if (client === null){
		console.log("FAILED: Didn't make connection");
		return 0;
	}else{
		console.log("Client connected");
		console.log(client);
	}

	//Add a user to the database
	const ret_id = await add_funs.new_user(client, 'test_add_user', 'test_add_pass', 'test_add_email@fake.com', 'test_add_first', 'test_add_last');

	if (ret_id === -1){
		console.log("FAILED FIRST ADD: Didn't insert user into table.  Make sure the test user was not already in the table.");

		//Close the client connection
		await client.end(()=>console.log("exited"));

		return 0;
	}else{
		console.log("PASSED FIRST ADD: Added user to table with ID: " + ret_id)
	}

	console.log("We are done with adding user, now we will see if the user is in the table.");

	//Dump table to make sure that the user was added
	await add_funs.dump_user_info(client);
	
	//TODO: add a second test were we try to add another user with the same info, should reject the request.
	console.log("Now we will test adding the same user, should not work.");

	const ret_id_2 = await add_funs.new_user(client, 'test_add_user', 'test_add_pass', 'test_add_email@fake.com', 'test_add_first', 'test_add_last');

	if (ret_id === -1){
		console.log("PASSED SECOND ADD: Didn't add duplicate user.");
	}else{
		console.log("FAILEd SECOND ADD: Added user to table with duplicate ID: " + ret_id_2);

		//Close the client connection
		await client.end(()=>console.log("exited"));

		return 0;
	}
		
}

if (require.main === module) {
	console.log("Starting test");
	main();
}