import express, { Router } from "express";
import socketIO from "socket.io";
import { createServer } from "http";
import path from "path";
import bodyParser from "body-parser";

import authRouter from "./routes/auth";
import usersRouter from "./routes/users"

class Server {
  httpServer;
  app;
  io;

  PORT = process.env.PORT || 5001;
  HOST = '0.0.0.0';

  constructor() {
   this.initialize();
   this.backendRoutes();
   this.handleSocketConnection();
  }

  initialize() {
    this.app = express();

    // hook app up with ejs views
    this.app.set("view engine", "ejs");
    this.app.use(express.static(path.resolve(__dirname, 'public')));// path.resolve(__dirname, 'public')

    // parse application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({ extended: true }))
    // parse application/json
    this.app.use(bodyParser.json())

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

    authRouter(this.app);
    usersRouter(this.app);

    this.app.get('/', (req, res) => {
      res.redirect('login');
    })

    this.app.get('/login', (req, res) => {
      //res.sendFile(path.resolve(__dirname, 'public', 'index.ejs'));
      res.render('login');
    });

    this.app.get('/register', (req, res) => {
      res.render('register');
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
