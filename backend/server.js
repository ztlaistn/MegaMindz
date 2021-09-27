import express from "express";
import socketIO from "socket.io";
import { createServer } from "http";

class Server {
  httpServer;
  app;
  io;

  PORT = 5001;
  HOST = '0.0.0.0';

  constructor() {
   this.initialize();
   this.backendRoutes();
   this.handleSocketConnection();
  }

  initialize() {
    this.app = express();
    // initialize the web (http) server
    this.httpServer = createServer(this.app);
    // initialize the Socket.IO server and attach it to the web server
    this.io = socketIO(this.httpServer);
  }

  /* backend routes exist here
  NOTE: will likely need to organize into seperate files as we add more routes*/
  backendRoutes() {
    this.app.get("/express", (req, res) => {
     res.status(200).send({
       data: "Hello World! -This is Malika"
       });
   });
  }

  handleSocketConnection() {
    this.io.on("connection", socket => {
     console.log("Socket connected.");
   });
  }

  // pass in a callback function that returns port number
  listen(callbackFunction) {
    this.httpServer.listen(this.PORT,this.HOST);
    callbackFunction(this.PORT);
  }
}
export {Server};
