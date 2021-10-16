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

