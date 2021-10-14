/* service will handle business logic */
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {login_validation} from "../../database/utils/user_database_utils";
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
  logIn(data) {

    // check if email is valid
    login_validation(connect_client(),data["email"])
      // check that encrypted password matches
      // var correct_password = CALL THE DATABASE AND GET THE FUNCTION
      var hash = ""
      bcrypt.compare(data["password"], hash, function (err, result) {
        if (result) {
          //create token
          var token = jwt.sign(data["password"], process.env);
          // update db with token, return
          return {logged_in: true, body: token}
        } else {
          return {logged_in: false, body: "Email or Password Incorrect"}
        }
      });


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
