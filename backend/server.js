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
        // this.app.get("/chatroom", (req,res) => {
        //     res.render("chatroom");
        // });
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

  // io.to = broadcast to everyone including self
  // socket.to = send to everyone except self
  handleSocketConnection() {
      const io = this.io;
      this.io.on("connection", function (socket) {
          let ourUsername;
          let roomId;
          var players = {};

          //TODO: any call: validate token, get user_id from it (or maybe from the socket itself)

          //TODO: On join: db call to make sure room_exists
          //TODO: On join: db call to make sure user is in that room

          //TODO: message send and disconnect only on the room (as string)
          
          console.log("Socket connected.");
          console.log("custom message.");
          socket.emit('new-message', 'Connection established with server');

          socket.on("new-user", function (data) {
              // save Username and Room ID for future use
              ourUsername = data.username;
              roomId = data.roomId;

              // put that socket in a specific room
              socket.join(roomId);

              // broadcast to room that this user has joined
              io.to(roomId).emit('new-message', `${ourUsername} has connected`);
              console.log(`${ourUsername} has connected`);

              //Phaser Sockets
              // create a new user and add it to our users object
              let playerInfo = {
                x: 0,
                y: 150,
                playerId: ourUsername
              };
              players[data.roomID] = {
                ourUsername: playerInfo
              };
              // send the users object to the new player
              io.emit('currentUsers', players[data.roomID]);
              // update all other users of the new user
              io.emit('newUser', players[data.roomID][ourUsername]);
          });

          socket.on('new-message', function (data)  {
            const { msg } = data;
            console.log("server received:" + data);
            // broadcast to room user's message
            io.to(roomId).emit("new-message", `${ourUsername}:  ${data}`);
          });

          socket.on('disconnect',function(){
            console.log('Client has disconnected');
            // broadcast to room that this user has left
            io.to(roomId).emit("new-message", `${ourUsername} has disconnected`);
          });
   });
  }

    // pass in a callback function that returns port number
    listen(callbackFunction) {
        this.httpServer.listen(this.PORT,this.HOST);
        callbackFunction(this.PORT);
    }
}
export {Server};
