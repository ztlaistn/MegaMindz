/*
* TODO: Don't let users input fields that are longer than can be stored in this table
*/

-- Next line will delete table if already exists (so that you can debug without having to delete it every time)
DROP TABLE IF EXISTS user_info;

CREATE TABLE
user_info (
-- It will generate an unique int userID when we add a new row
	UserID 			SERIAL NOT NULL PRIMARY KEY,
-- Fields required to create account
	Email 			VARCHAR(100) NOT NULL DEFAULT '',
	Username 		VARCHAR(50) NOT NULL DEFAULT '',
	Pass			VARCHAR(50) NOT NULL DEFAULT '',
-- Additional account information (feel free to add more to this, as we add features)
	FirstName		VARCHAR(30) NOT NULL DEFAULT '',
	LastName		VARCHAR(30) NOT NULL DEFAULT '',
	DOB				DATE DEFAULT '1900-01-01',
	Location		VARCHAR(50) NOT NULL DEFAULT '',
	Status			VARCHAR(200) NOT NULL DEFAULT '',
	Skills			VARCHAR(200) NOT NULL DEFAULT '',
	CurrRoom		INT DEFAULT NULL,
-- Might want to just disable row, rather than delete entry when account is removed
	Enabled			SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX index1 ON user_info(Enabled, Username, Pass);

CREATE INDEX index2 ON user_info(Enabled, Lastname, Firstname);

CREATE INDEX index3 ON user_info(Enabled, CurrRoom, UserID);
	
-- Will print table structure when created
-- DESCRIBE user_info;

