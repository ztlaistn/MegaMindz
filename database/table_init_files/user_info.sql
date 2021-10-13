/*
* TODO: Don't let users input fields that are longer than can be stored in this table
*/

-- Next line will delete table if already exists (so that you can debug without having to delete it every time)
DROP TABLE IF EXISTS user_info;

CREATE TABLE
user_info (
-- It will generate an unique int userID when we add a new row
	user_id 		SERIAL NOT NULL PRIMARY KEY,
-- Fields required to create account
	email 			VARCHAR(100) NOT NULL DEFAULT '',
	username 		VARCHAR(50) NOT NULL DEFAULT '',
	hash			VARCHAR(50) NOT NULL DEFAULT '',
	salt			VARCHAR(50) NOT NULL DEFAULT '',
-- Additional account information (feel free to add more to this, as we add features)
--first_name		VARCHAR(30) NOT NULL DEFAULT '',
--last_name			VARCHAR(30) NOT NULL DEFAULT '',
	full_name		VARCHAR(80) NOT NULL DEFAULT '',
	dob				DATE DEFAULT '1900-01-01',
	location		VARCHAR(50) NOT NULL DEFAULT '',
	status			VARCHAR(200) NOT NULL DEFAULT '',
	skills			VARCHAR(200) NOT NULL DEFAULT '',
	curr_room		INT DEFAULT NULL,
-- Might want to just disable row, rather than delete entry when account is removed
	enabled			SMALLINT NOT NULL DEFAULT 1
);

CREATE INDEX index1 ON user_info(enabled, username, hash);
CREATE INDEX index2 ON user_info(enabled, curr_room, user_id);
CREATE INDEX index3 ON user_info(enabled, username, salt);
	
-- Will print table structure when created
-- DESCRIBE user_info;

