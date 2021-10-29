import express, { Router } from "express";
import socketIO from "socket.io";
import { createServer } from "http";
import path from "path";
import bodyParser from "body-parser";

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import roomRouter from "./routes/room";

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
        this.app.get("/chatroom", (req,res) => {
            res.render("chatroom");
        });
        const rootdir = __dirname.substring(0, __dirname.length-7);
        const root = require('path').join(rootdir, 'frontend', 'meetngreet', 'build')
            this.app.use(express.static(root));
            this.app.get("*", (req, res) => {
                res.sendFile('index.html', { root });
            })

        authRouter(this.app);
        usersRouter(this.app);
        roomRouter(this.app);

        this.app.get('/register', (req, res) => {
            res.render('register');
        });

    /*this.app.get("/chat/:room", (req, res) => {
      res.render("chatroom" , {roomId: req.param.room});
    });*/
  }

  handleSocketConnection() {
      const io = this.io;
      this.io.on("connection", function (socket) {
          let user;

          //TODO: any call: validate token, get user_id from it (or maybe from the socket itself)

          //TODO: On join: db call to make sure room_exists
          //TODO: On join: db call to make sure user is in that room

          //TODO: message send and disconnect only on the room (as string)
          
          console.log("Socket connected.");
          socket.emit('new-message', 'Connection established with server');

          socket.on("new-user", function (username) {
              // save username for future use
              user = username;
              io.emit('new-message', `${username} has connected`);
          });

          socket.on('new-message', function (data) {
            const { msg } = data;
            console.log("server received:" + msg);
            io.emit("new-message", `${user}:  ${msg}`);
          });
          socket.on('disconnect',function(){
            console.log('Client has disconnected');
            io.emit("new-message", `${user} has disconnected`);
          });

     /*socket.on("join-room", (roomId, userId) => {
       socket.join(roomId);
       socket.emit("")});*/
   });
  }

    // pass in a callback function that returns port number
    listen(callbackFunction) {
        this.httpServer.listen(this.PORT,this.HOST);
        callbackFunction(this.PORT);
    }
}
export {Server};
