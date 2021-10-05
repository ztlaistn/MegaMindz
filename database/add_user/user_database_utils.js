// Functions for creating a user in the database (and looking one up)
const {Pool, Client} = require('pg');

/* TODO: At the moment, these functions return specific values on failure.  It might be better to have them throw an error and call them with try/catches.

/**
* Async Function makes a client to our database with our given enviroment variables.  
* Then connects it and returns the client object.
* 
* In the future, we might want to implement this by initializing a pool at some point and just taking a client from the pool.
*
* Return: If connected, returns the client object, otherwise returns null
**/
async function connect_client(){
	const client = new Client({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		port: Number(process.env.DB_PORT),
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
	});
	
	// I want to use the callback so I can print the err message, but then the function returns before the connect has finished.
	
	await client.connect(err =>{
		if(err){
			console.log(err)
			return null;
		}else{
			console.log(client)
			return client;
		}
	});

	//client.connect();

	//return client;
}


/**
* Async Function to create a new row in the user_info table
* Parameters:
* client: client that has made a connection with the database and user_info table (this will not be closed in this function)
* user: new username
* pass: new Password
* email: new email
* first: new first name
* last: new last name
* 
* Return: Returns the UserID of the inserted row, or -1 if not inserted.
**/
async function new_user(client, user, pass, email, first, last){
	// Should first do a select query to see if that username and/or email area already in user
	const select_query = {
		text: 'SELECT COUNT(*) FROM user_info WHERE Username = $1 OR Email = $2',
		values: [user, email]
	};
	
	await client.query(select_query, (err, res) => {
		console.log("we are not done adding the user");
		if (res.rows[0].count > 0){
			return -1;
		}else{
			const insert_query = {
				text: 'INSERT INTO user_info (Username, Pass, Email, FirstName, LastName) VALUES ($1, $2, $3, $4, $5) RETURNING UserID',
				values: [user, pass, email, first, last],
			};

			await client.query(insert_query, (err, res) =>{
				if(err){
					return -1;
				}else{
					//Inserted, return the UserID
					uid = res.rows[0].UserID;
					return uid;
				}
			});
		}
	});
}


/**
* Async Function that logs the contents of the user info table, for debuging.
* Parameters:
* 	- client: 		client object that is connected to the database and user_info table (will not be closed in this function)
* 	- field = "": 	If there is a specific field you want to filter for.
					By default, it will just dump the entire table.
* 	- value = "":	The value you want to dump in the given field.
					Ignored if no field is passed
* Return: None
**/
async function dump_user_info(client, field = "", value = ""){
	if (field === ""){
		// just dump the entire table
		await client.query('SELECT * FROM user_info', (err, res) =>{
			if(err){
				console.log("err in dump", err);
			}else{
				console.log("dump data", res);
			}	
		});
	}else{
		// we have been given specific information
		const select_query = {
			text: 'SELECT * FROM user_info WHERE ' + field + ' = $1',
			values: [value]
		};
		
		await client.query(select_query, (err, res) =>{
			if(err){
				console.log("err in dump", err);
			}else{
				console.log("dump data", res);
			}	
		});
	}
}


/**
* Async function that uses the UserID field in the user_info table to return the user with that given ID.
* Parameters: 
* 	- client:   client object that is connected to the database and user_info table (will not be closed in this function) 
* 	- id: 		UserID value for the user we are trying to lookup
* Returns: 
* 	- res.rows[0] that corresponds to UserId passed
*   - null if it didn't find exactly 1 user.
**/
async function select_user_with_id(client, id){
	const select_query = {
		text: 'SELECT 1 FROM user_info WHERE UserID = $1',
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


module.exports = {
	connect_client,
	new_user,
	dump_user_info,
	select_user_with_id,
};
