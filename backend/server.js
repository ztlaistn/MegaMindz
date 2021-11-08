import express, { Router } from "express";
import socketIO from "socket.io";
import { createServer } from "http";
import path from "path";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import roomRouter from "./routes/room";

import DbUtil from "../database/utils/user_database_utils";
import DbRoll from "../database/utils/room_role_database_utils";

import {validateSocketToken} from "./middleware/tokenAuth";
import roomFuncs from "./roomFuncs";

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


    handleSocketConnection() {
        const io = this.io;
        this.io.on("connection", async function (socket) {
            // variables for this connection
            let ourUsername;
            let ourUserId = -1;
            let ourRoomId = -1;

            console.log("Socket connected.");
            socket.emit('new-message', {message:'Trying to connect user to room.'});

            /*
            * Handler function that will handle a new user event.
            * Parameters:
            *   - data object includes
            *       - token: user's session token
            *       - roomId: room they are trying to connect to (this must be a number)
            * Will emit a new user new-message to the room if success.
            * Otherwise will trigger error event with error message.
            */
            // io.to = broadcast to everyone in room including self
            // socket.to = broadcast to everyone in room except self
            socket.on("new-user", async function (data) {
                const {auth, roomId} = data //should we be getting the token from the header?

                let setupFlag = false;
                try{
                    const retData = await roomFuncs.handleNewChatSocketUser(io, socket, auth, roomId);
                    ourUserId = retData.userId;
                    ourRoomId = retData.roomId;
                    ourUsername = retData.username;
                    setupFlag = true;
                } catch (err){
                    console.log(err);
                    socket.emit('error', {message:errString});
                }

                if (setupFlag){
                    // TODO: if we are here, we can assume we setup correctly
                    // Can put any code here for future functions on socket connection
                }
            });


            /*
            * Handler function that will handle a room message relay events.
            * Will emit the message to everyone in the room if the user is in a room.
            * Otherwise will trigger error event with error message.
            */
            socket.on('new-message', function (data)  {
                const { auth, msg } = data;
                roomFuncs.newChatMessageEvent(io, socket, ourUserId, ourRoomId, ourUsername, auth, msg);
            });


            /*
            * Handler function that will handle a disconnect event.
            * Will emit a disconnect new-message to the room if success.
            * Otherwise will trigger error event with error message.
            */
            socket.on('disconnect', async function(){
                // start by checking the userId and roomId are set (user has connected)
                try{
                    await roomFuncs.socketDisconnectEvent(io, socket, ourUserId, ourRoomId, ourUsername);
                } catch (err){
                    console.log(err);
                    socket.emit('error', {message:err})
                }
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
