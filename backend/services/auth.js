/* service will handle business logic */
export default {

  /*Input: Object with username, password1, password2, and email
    Output: Object with successValue [bool], uid [int], and errorMsg [string]
      SUCCESS: isSuccess=true with valid auth token and uid
      ERROR: isSuccess=false with error message
  */
  register(data) {
    const { username, email, password1, password2 } = data;
    // check that password 1 and password 2 match
    if (password1 !== password2) {
      return {isSuccess: false, errorMsg: "Provided passwords do not match"};
    }
    // verify that a user with that email does not already exist
    // INSERT database method here [from user model]

    // generate salt
    /*bcrypt.genSalt(saltRounds, function(err, salt) {
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
    const { email, password } = data;
    // check if token already exists
    // check if email is valid
    // check that encrypted password matches
    // create token, update db with token, return
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
