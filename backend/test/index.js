// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';
import {Server} from '../server';

// Configure chai
chai.use(chaiHttp);
chai.should();

// Use httpServer for testing routes
const server = new Server();
const testServer = server.httpServer;

describe("Test Route", () => {
    describe("GET /express", () => {
        // Test for default endpoint
        it("It should return an object with data in it", (done) => {
              chai.request(testServer)
                  .get('/express')
                  .end((err, res) => {
                      res.should.have.status(200);
                      res.body.should.be.a('object');
                      done();
                  });
          });
    });
});
export { testServer };
