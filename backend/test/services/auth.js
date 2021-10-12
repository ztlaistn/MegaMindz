import AuthService from "../../services/auth";
import { assert } from "chai";

describe("Authorization Service", () => {
    describe("register", () => {
      it("should return with error if passwords don't match", () => {
          const data = {
            username: "testusername",
            email: "test@email.com",
            password1: "password324",
            password2: "password546"
          };
          const returned = AuthService.register(data);
          assert.isFalse(returned.isSuccess);
          assert.equal(returned.errorMsg, "Provided passwords do not match", "Correct error message provided");
        });
      it("should return successful if user account is created", () => {
          const data = {
            username: "testusername",
            email: "test@email.com",
            password1: "password",
            password2: "password"
          };
          const returned = AuthService.register(data);
          assert.isTrue(returned.isSuccess);
          assert.isNotNaN(returned.uid, "User ID must be a number");

      });
    });
});
