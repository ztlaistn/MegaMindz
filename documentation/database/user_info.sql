/*
* Create database table for user info
* TODO: Fill in the actual database name, once it is made
* TODO: Don't let users input fields that are longer than can be stored in this table
*/

USE <database_name>;

-- table_name = user_info
-- Next line will delete table if already exists (so that you can debug without having to delete it every time)
-- DROP TABLE IF EXISTS user_info;

CREATE TABLE
user_info (
-- It will generate an unique int userID when we add a new row
	UserID 			INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
-- Fields required to create account
	Email 			VARCHAR(100) NOT NULL DEFAULT "",
	Username 		VARCHAR(50) NOT NULL DEFAULT "",
	Password		VARCHAR(50) NOT NULL DEAFULT "",
-- Additional account information (feel free to add more to this, as we add features)
	FirstName		VARCHAR(30) NOT NULL DEAFULT "",
	LastName		VARCHAR(30) NOT NULL DEAFULT "",
	DOB				DATE DEAFULT "0000-00-00",
	Location		VARCHAR(50) NOT NULL DEAFULT "",
	Status			VARCHAR(200) NOT NULL DEFAULT "",
	Skill			VARCHAR(200) NOT NULL DEFAULT "",
-- Might want to just disable row, rather than delete entry when account is removed
	Enabled			TINYINT NOT NULL DEFAULT 0,
);

-- Will print table structure when created
DESCRIBE user_info