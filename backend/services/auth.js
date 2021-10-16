/* service will handle business logic */
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  get_user_ids_from_fields,
  login_validation,
  select_user_with_id, set_field_for_user_id
} from "../../database/utils/user_database_utils";
import {connect_client} from "../../database/utils/user_database_utils";
export default {

  /*Input: Object with username, password1, password2, and email
    Output: Object with successValue [bool], uid [int], and errorMsg [string]
      SUCCESS: isSuccess=true with valid auth token and uid
      ERROR: isSuccess=false with error message*/
  register(data) {
    const { username, email, password1, password2 } = data;
    // check that password 1 and password 2 match
    if (password1 !== password2) {
      return {isSuccess: false, errorMsg: "Provided passwords do not match"};
    }
    // verify that a user with that email does not already exist
    // INSERT database method here [from user model]

    // generate salt
    /*const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
            // store user, store username, email, hash, and salt in db
            // return uid
        });
    });*/

    let tempUid = 29;
    return {isSuccess: true, uid: tempUid};
  },

  /*Input:
    Output:
    Behavior:
  */
  async logIn(data) {

    var client = connect_client()
    var ids = await get_user_ids_from_fields(client,"email",data["email"])
    var row = await select_user_with_id(client,ids[0])
    // check if email is valid

      // check that encrypted password matches
      // var correct_password = CALL THE DATABASE AND GET THE FUNCTION
      var hash_ = row.hash
      bcrypt.compare(data["password"], hash_, function (err, result) {
        if (result) {
          //create token
          var token = jwt.sign(data["password"], process.env.TOKEN);
          // update db with token, return

          set_field_for_user_id(client,ids[0],"token", token)
          return {logged_in: true, body: token}
        }
      });
    return {logged_in: false, body: "Email or Password Incorrect"}

  },

  /*Input:
    Output:
    Behavior:
  */
  logOut() {
    // might need AUTH header - check this
    // delete user token from db
  },

  // create JSON Web Token
  // MOVE THESE TO MIDDLEWARE FOLDER
  createToken() {

  },

  validateToken() {

  },

  destroyToken() {

  },
}
