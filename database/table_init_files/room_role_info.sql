/* Table that will hold a user's info that corresponds to a given chat room */  

/* Roles (a role x will have all the priv of role x-1):
	- 0: guest
	- 1: VIP
	- 2: Moderator
	- 3: Owner
*/

-- Next line will delete table if already exists (so that you can debug without having to delete it every time)
DROP TABLE IF EXISTS room_role_info;

CREATE TABLE
room_role_info (
-- This will be ther user that we are storing the information for (their user_id from the user_info table)
	user_id 		INT NOT NULL PRIMARY KEY,
-- This is the room that the row corresponds to, they will be random ints
	room_code 		INT NOT NULL DEFAULT -1,
-- This is the user's role in that room  (see comment above for meaning)
	role 			INT NOT NULL DEFAULT 1
-- Might want to just disable row, rather than delete entry when account is removed
-- enabled			SMALLINT NOT NULL DEFAULT 1
);

CREATE INDEX index1_room ON room_role_info(room_code, user_id, role);

-- Will print table structure when created
-- DESCRIBE user_info;

