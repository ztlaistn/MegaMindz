// Functions for creating a user in the database (and looking one up)
const {Pool, Client} = require('pg');

/* TODO: At the moment, these functions return specific values on failure.  It might be better to have them throw an error and call them with try/catches.

/**
* Function makes a client to our database with our given enviroment variables.  
* Then connects it and returns the client object.
*
* In the future, we might want to implement this by initializing a pool at some point and just taking a client from the pool.
*
* Return: A promise to connect to the database.  Will resolve with the connected client if successful.  Will reject with the error if failed.
**/
function connect_client(){
	const client = new Client({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		port: Number(process.env.DB_PORT),
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
	});
	
	return new Promise((resolve, reject) => client.connect(err =>{
		if(err){
			reject("error in connect_client: " + err);
		}else{
			resolve(client);
		}
	}));
}

/**
* Function checks if there is a user in the table that shares the username or email.
* Mainly a helper function for the new_user function to check if they are about to add a duplicate.
* Parameters:
* 	client: client that has made a connection with the database and user_info table (this will not be closed in this function)
*	user: 	username to check against
*	email: 	email to check against
*
*	Return: A promise that will reject when there is a match in the table, passing a error string.
*			If the email and username are unique, it will resolve with no parameters.
*/
function user_or_email_unique(client, user, email){
	const select_query = {
		text: 'SELECT COUNT(*) FROM user_info WHERE username = $1 OR email = $2',
		values: [user, email]
	};
	return new Promise((resolve, reject) => client.query(select_query, (err, res) =>{
		if (err){
			reject("Error in user_or_email_unique: " + err)
		}else if(res.rows[0].count > 0){
			reject("Number of rows already containing this data: " + res.rows[0].count)
		}else{
			resolve(res.rows[0].count);
		}
	}));
}

/**
 * Function that will actually insert the row into the database for the new user.
 * Only used as a helper function for new_user, so it is not in the export list for this file.
 * Parameter:
* 	client: client that has made a connection with the database and user_info table (this will not be closed in this function)
* 	user: new username
* 	pass: new Password
* 	email: new email
* 	first: new first name
* 	last: new last name
*
* Return: 	A promise where, when query has an error, will reject with that error.
*			When it inserts correctly (and there is no error), will resolve with user_id
 */
function insert_new_user_row(client, user, pass, email, first, last){
	const insert_query = {
		text: 'INSERT INTO user_info (username, pass, email, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
		values: [user, pass, email, first, last],
	};
	
	return new Promise((resolve, reject) => client.query(insert_query, (err, res) =>{
		if(err){
			reject("Error in insert_new_user_row: " + err)
		}else{
			//Inserted, return the user_id
			uid = res.rows[0].user_id;
			resolve(uid);
		}
	}));
}

/**
* Function to create a new row in the user_info table
* Parameters:
* 	client: client that has made a connection with the database and user_info table (this will not be closed in this function)
* 	user: new username
* 	pass: new Password
* 	email: new email
* 	first: new first name
* 	last: new last name
* 
* Return: 	A promise where, when a successfull insert has happened it will resolve, passing the user_id of the new user.
			When the user_or_email_unique check fails, it will reject with the error message.
			When the insert fails, it will reject with the error message.
**/
async function new_user(client, user, pass, email, first, last){
	// Should first see if that username and/or email area already in user_info table
	
	// This doesn't seem like the correct way to do this with Promises
	// Seems like it might break any kind of concurrency, but its the only way I can 
	// think to nest two function calls into a promise return.
	try{
		const count = await user_or_email_unique(client, user, email);
	} catch (err) {
		// returns a promise that instantly rejects
		return new Promise((resolve, reject) => {
			reject(err);
		});
	}

	try{
		const uid = await insert_new_user_row(client, user, pass, email, first, last);

		// returns a promise that instantly resolves
		return new Promise((resolve, reject) => {
			resolve(uid);
		});
	} catch (err){
		// returns a promise that instantly rejects
		return new Promise((resolve, reject) => {
			reject(err);
		});
	}
}


/**
* Function that logs the contents of the user info table, for debuging.
* Parameters:
* 	- client: 		client object that is connected to the database and user_info table (will not be closed in this function)
* 	- field = "": 	If there is a specific field you want to filter for.
					By default, it will just dump the entire table.
* 	- value = "":	The value you want to dump in the given field.
					Ignored if no field is passed
* 
* Return: 	A Promise which, when the table dump is successful, will simply resolve with true.
			When it fails, it will reject with the error message from the select call.
**/
function dump_user_info(client, field = "", value = ""){
	if (field === ""){
		// just dump the entire table
		select_query = {
			text: 'SELECT * FROM user_info'
		};

		return new Promise((resolve, reject) => client.query(select_query, (err, res) => {
			if(err){
				reject("Error in dump_user_info: " + err);
			}else{
				console.log("Data in user_info: \n" + JSON.stringify(res.rows, null, 2))
				resolve(true);
			}
		}));
	}else{
		// we have been given specific information
		const select_query = {
			text: 'SELECT * FROM user_info WHERE ' + field + ' = $1',
			values: [value]
		};
		
		return new Promise((resolve, reject) => client.query(select_query, (err, res) => {
			if(err){
				reject("Error in dump_user_info specific: " + err);
			}else{
				console.log("Data in user_info that matched parameters: \n" + JSON.stringify(res.rows, null, 2))
				resolve(true);
			}
		}));
	}
}


/**
* Async function that uses the user_id field in the user_info table to return the user with that given ID.
* Parameters: 
* 	- client:   client object that is connected to the database and user_info table (will not be closed in this function) 
* 	- id: 		user_id value for the user we are trying to lookup
* Returns: 
* 	- res.rows[0] that corresponds to user_id passed
*   - null if it didn't find exactly 1 user.
**/
async function select_user_with_id(client, id){
	const select_query = {
		text: 'SELECT 1 FROM user_info WHERE user_id = $1',
		values: [id]
	};
	
	await client.query(select_query, (err, res) => {
		if(err){
			console.log("err in select with id", err);
			return null;
		}else{
			//Need to figure out how many rows we returned, not sure if this is the correct way
			if (res.length === 1){
				return res.rows[0];
			}else{
				console.log("Found exactly " + res.length + " users with that ID in the user_info table.")
				return null;
			}
		}
	});
}

/**
* Function that will delete a user that matches all of the passed fields.
* It is a dangerous function.
* Called mainly by test code, to ensure that we remove the test users from previous runs before the next run.
* Parameters:
*	client: client that has made a connection with the database and user_info table (this will not be closed in this function)
* 	user: new username
* 	pass: new Password
* 	email: new email
* 	first: new first name
* 	last: new last name
* 
* Return:	A promise where, when the query has an error, will reject with that error.
*			When the delete is done (or there is nothing to delete), it will resolve with true.
*/
function delete_user(client, user, pass, email, first, last){
	delete_query = {
		text: 'DELETE FROM user_info WHERE username = $1 AND pass = $2 AND email = $3 AND first_name = $4 AND last_name = $5',
		values: [user, pass, email, first, last]
	};

	return new Promise((resolve, reject) => client.query(delete_query, (err) =>{
		if(err){
			reject("Error in delete user: " + err);
		}else{
			resolve(true);
		}
	}));

}

module.exports = {
	connect_client,
	user_or_email_unique,
	new_user,
	dump_user_info,
	select_user_with_id,
	delete_user
};
