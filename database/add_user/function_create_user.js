// Function for creating a user in the database

const {Pool, Client} = require('pg');


/**
* Function makes a client to our database with our given enviroment variables.  
* Then connects it and returns the client object.
* 
* In the future, we might want to implement this by initializing a pool at some point and just taking a client from the pool.
*
* Return: If connected, returns the client object, otherwise returns null
**/
function connect_client(){
	const client = new Client({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		port: Number(process.env.DB_PORT),
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
	});
	
	// I want to use the callback so I can print the err message, but then the function returns before the connect has finished.
	
	// client.connect(err =>{
	// 	if(err){
	// 		console.log(err)
	// 		return null;
	// 	}else{
	// 		console.log(client)
	// 		return client;
	// 	}
	// });

	client.connect();

	return client;
}


/**
* Function to create a new row in the user_info table
* Parameters:
* client: client that has made a connection with the user_info table (this will not be closed in this function)
* user: new username
* pass: new Password
* email: new email
* first: new first name
* last: new last name
* 
* Return: Returns the UserID of the inserted row, or -1 if not inserted.
**/
function new_user(client, user, pass, email, first, last){
	// Should first do a select query to see if that username and/or email area already in user
	const select_query = {
		text: 'SELECT COUNT(*) FROM user_info WHERE Username = $1 OR Email = $2',
		values: [user, email]
	};
	
	client.query(select_query, (err, res) => {
		console.log("we are not done adding the user");
		if (res.rows[0].count > 0){
			return -1;
		}else{
			const insert_query = {
				text: 'INSERT INTO user_info (Username, Pass, Email, FirstName, LastName) VALUES ($1, $2, $3, $4, $5) RETURNING UserID',
				values: [user, pass, email, first, last],
			};

			client.query(insert_query, (err, res) =>{
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
* Function that logs the contents of the user info table, for debuging.
* Parameters:
* 	- client: 		client object that is connected to the user_info table (will not be closed in this function)
* 	- field = "": 	If there is a specific field you want to filter for.
					By default, it will just dump the entire table.
* 	- value = "":	The value you want to dump in the given field.
					Ignored if no field is passed
* Return: None
**/
function dump_user_info(client, field = "", value = ""){
	if (field === ""){
		// just dump the entire table
		client.query('SELECT * FROM user_info', (err, res) =>{
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
		client.query(select_query, (err, res) =>{
			if(err){
				console.log("err in dump", err);
			}else{
				console.log("dump data", res);
			}	
		});
	}
}

module.exports = {
	connect_client,
	new_user,
	dump_user_info
};
