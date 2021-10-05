/**
* Tests create user functions on local PostgreSQL database
**/

const {Pool, Client} = require('pg');
const add_funs = require("../add_user/user_database_utils.js")

/**
* Runs the tests.
**/ 
async function main(){
	//TODO: these functions all have to happen in order, but they do not at the momment.

	//Connect a client to local
	//Assumes you have set the enviroment variables
	const client = await add_funs.connect_client();
	
	//Add a user to the database
	await add_funs.new_user(client, 'test_add_user', 'test_add_pass', 'test_add_email@fake.com', 'test_add_first', 'test_add_last');

	console.log("we are done with adding user");

	//Dump table to make sure that the user was added
	add_funs.dump_user_info(client, ()=>{
		//Close the client connection
		client.end(()=>console.log("exited"))
	});
	
	//TODO: add a second test were we try to add another user with the same info, should reject the request.
	
}

if (require.main === module) {
  main();
}