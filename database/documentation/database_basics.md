***Basic Database Usage***

This refers to the user_info table.

**Getting Started**

The first thing you are going to have to do is either import or require the user_database_utils.js file.
This will be located in the database/utils directory.
The functions that you can call have been sent through module.export.

**Promise Based Implementation**

All the database function in the user_database_utils.js file are promise based. 
That means that they will have to be used with some kind of synchronization in mind (whether async/await or callbacks) 
to ensure they complete in the order you intend.

**Enviroment Variables**

Setting enviroment variables is important for the connection to the database.  The following enviroment variables will have to be set to the appropriate database credentials:
    - DB_HOST
    - DB_USER
    - DB_PORT
    - DB_PASSWORD
    - DB_DATABASE
If this is being hosted, these should be set by heroku.  If you are testing locally, these will have to be set before running the tests.
This can probably be done best by making an executable script that sets the enviroment variables and then makes the call to the tests.

**Before Making A Query**

The first step to making a query is to make a client object (a client for database queries, not a client of the web service) and connect it to the database.
This can be done by calling the database connect_client() function.  
This will return a promise that, on resolution will pass a client object that has established a connection with the database.
This client object will have to be passed to any other database utils functions you make, so they can make the queries to the database.

**The user_info Table Columns**

There are a few categories:

Auto Generated:    
- user_id (type: serial/int): a unique user_id is created automatically when a new row is made

Manditory (Fields that are passed when adding a new user.  All users must have values for these fields):
    - email (type: char string): User's email address.  This must be unique for each user.
    - username (type: char string): User's username.  This must be unique for each user.
    - hash (type: char string): This is the hash generated using the user's plaintext password.  also has the salt alredy appended to it.

Optional (Fields that are not intialized to meaningful values right away, can be set later):
    - token (type: sql text, if fetched will be a string): jwt authentication token string.
        - Initalized to null, and should be set back to null when a user logs out.  Note: this means you have to pass that actual keyword null as your value, not the string "null"
    - full_name (type: char string): user's full name (usually just 'firstname lastname').
        - Initalized to an empty string
    - dob (type: date): user's date of birth, can be used to calculate age.
        - Inialized to '1900-01-01'
    - location (type: char string): for user to input where they live if they want that on profile.
        - Initalized to empty string
    - status (type: char string): for user to input a bio for their profile.
        - Initalized to empty string
    - skills (type: char string): for user to input a list of their skills for display on profile.
        - Initalized to empty string

Enabled value:
    - This wiil be of type smallint and ititalized to 1
    - If 0, that means the user account has been deleted
    - Flipping this value is an alternative to deleting a row from the table if you want to save the information of deleted accounts.

**Adding a New User**

There is a function in the user_database_utils.js that will do this called new_user.
This function will require that you pass it the client object, and all the madatory fields.
It will return a promise that, on success, will resolve passing the user_id of the row added to the table.

**Getting User ID**

If a field/value pair is known about a user, you can call the get_user_ids_from_fields function to return a list of user_id's that match your field/value pair.

**Using User ID to Get Row**

Once you have the user_id, you can get the entire row (all the data for that user).
This is done by calling select_user_with_id.  Which will return the row that matches that ID (on promise resolution).
To actually access the values in this row you use the '.'
For example, if you wanted access the username of a returned row:
    - returned_row.username

**Changing/Setting Values for a User**

If you know the user_id of a user, you can change their values.
This can be done with a call to set_field_for_user_id.  Which will take the client object, the user_id, the field (a string), and the value (whatever type you are trying to input into the table).

**Other Functions**

There are multiple other more specific functions in the user_database_utils.js file.  All functions have detailed header comments explaining their purpose and how to use them.

**Misc**

Strings returned from SELECT queries will be in single quotes, if that matters.

Due to indexs made in the user_info table, it will be quicker to query a user based on their email, than based on their username.

If there is a variable field being used in a query, it is injected directly with string concat.  This is NOT open our database to injection attacks.
The reason for this is that we assume that the user should never have the power to set a query field.  The only one calling these functions are backend functions.
The backend functions will always be looking for a specific function, and so they will simply pass a string constant that the user never had a chance to modify (unlike the values, that ARE dangerous, thus is run through the built in sanitation).
If the user already has acces to the backend, its probably too late.

***Room Role Info Table***

There is now also a table that will store the roles of users in a given room.  It will have the following fields:
	- room_role_id (type: int): primary key for the table, needed since we can have duplicate user_id in this table
    - user_id (type int): This will be the user that we are storing the information for (their user_id from the user_info table)
    - room_code (type int): This will be a room that the row corresponds to, this will be randomly generated, and should not match any rows that already exist
    - role (type: int): This will be the role of the user in the given room
        Roles (a role x will have all the priv of role x-1):
	        - 0: guest
	        - 1: VIP
	        - 2: Moderator
	        - 3: Owner

**Connecting to the Room role table:** Simply user the connect_client() function from user_database_utils.js

**Supported Functions**

room_exists: given a connected client and a room_code, will check if there are any rows in the database containing that room_code.  If theree are no sql errors, will either resolve with true or false.

create_new_room: Will check if the room you want to add already exists.  If it does, it will resolve with -1.  If it doesn't, it will add the row to the table, with the owner getting an owner role.  Then resolve with the added room_code (should be the same one as passed).

find_user_in_room_roll: will take a client, user_id, and room_code.  Returns the user's row in the given room, or null if they do not have a role in that room yet.

set_role: takes a client, user_id, role, and room_code.  Gives the user that given role in that given room.  If the user already has a role in that room, updates that row, otherwise makes a new row.  Returns a promise that will resolve with the row that was modified/added (should be the same one passed).

close_room: takes a client and room_code.  Will delete all rows in the table that refer to the given room.  Will return a promise with the room_code of the affected rows.
