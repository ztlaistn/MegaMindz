import { testServer } from "../index";

// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';

describe("Authentication Routes", () => {
    describe("POST /auth/register", () => {

        it("should return 400 if not all required data is provided", (done) => {
              chai.request(testServer)
                  .post('/auth/register')
                  .send({ // missing the email
                    username: 'testusername',
                    password1: 'testpassword',
                    password2: 'testpassword'
                    })
                  .end((err, res) => {
                      res.should.have.status(400);
                      res.body.should.be.a('string');
                      done();
                  });
          });

          it("should return 201 if correct data is provided", (done) => {
                chai.request(testServer)
                    .post('/auth/register')
                    .send({ // has email, password1, password2, and username
                      email: "test@email.com",
                      username: 'testusername',
                      password1: 'testpassword',
                      password2: 'testpassword'
                      })
                    .end((err, res) => {
                        res.should.have.status(201);
                        res.body.should.be.a('string');
                        done();
                    });
          });
          it("should return 409 if creating account fails (passwords don't match)", (done) => {
                chai.request(testServer)
                    .post('/auth/register')
                    .send({ // has email, password1, password2, and username
                      email: "test@email.com",
                      username: 'testusername',
                      password1: 'testpassword543',
                      password2: 'testpassword246'
                      })
                    .end((err, res) => {
                        res.should.have.status(409);
                        res.body.should.be.a('string');
                        done();
                    });
          });
    });
});
