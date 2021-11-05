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
            socket.emit('new-message', {message:'Connection established with server'});

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
                let socClient = null;

                const tokenUID = validateSocketToken(auth);
                if (tokenUID < 0){
                    const errString = "SOCKET NEW-USER ERROR #0: Access Denied";
                    console.log(errString);
                    socket.emit('error', {message:errString});
                }else{
                    // set our_userId based on the packet
                    ourUserId = tokenUID;
                    // connect a client to the database
                    try{
                        socClient = await DbUtil.connect_client()
                    } catch (err){
                        socClient = null
                        const errString = "SOCKET NEW-USER ERROR #1: Couldn't connect to database: " + err;
                        console.log(errString)
                        socket.emit('error', {message:errString})
                    }
                }

                // if we connected, check that the room exists
                if (socClient){
                    try{
                        const flag = await DbRoll.room_exists(socClient, roomId);
                        if(flag){
                            const row = await DbUtil.select_user_with_id(socClient, ourUserId);
                            socClient.end();
                            if(row.curr_room === roomId){
                                // Everything was correct, set the variables and connect them to the room
                                ourUsername = row.username;
                                ourRoomId = roomId;
                                console.log(`${ourUsername} has connected to room ${ourRoomId}`);
                                socket.join(roomId.toString());
                                io.to(roomId.toString()).emit('new-message', {message:`${ourUsername} has connected`});
                            }else{
                                socClient.end()
                                let errString = "SOCKET NEW-USER ERROR #2: User trying to connect to socket for room they are not in.";
                                errString = errString + "\nGot :" + row.curr_room + " but expecte: " + roomId;
                                console.log(errString);
                                socket.emit('error', {message:errString});
                            }
                        }else{
                            socClient.end()
                            const errString = "SOCKET NEW-USER ERROR #3: User trying to connect to socket for room that doesn't exist.";
                            console.log(errString);
                            socket.emit('error', {message:errString})
                        }
                    } catch (err){
                        socClient.end()
                        const errString = "SOCKET NEW-USER ERROR #4: DB Error: " + err;
                        console.log(errString);
                        socket.emit('error', {message:errString})
                    }
                }
            });


            /*
            * Handler function that will handle a room message relay events.
            * Will emit the message to everyone in the room if the user is in a room.
            * Otherwise will trigger error event with error message.
            */
            socket.on('new-message', async function (data)  {
                const { auth, msg } = data;
                console.log(auth)
                console.log(msg)

                // start by checking the userId and roomId are set (user has connected)
                if(ourRoomId === -1 || ourUserId === -1){
                    socket.emit('error', {message:"SOCKET NEW-MESSAGE ERROR #1: User trying to relay message when they are not connected to a room."});
                }else{
                    const tokenUID = validateSocketToken(auth);
                    if (tokenUID < 0 || tokenUID !== ourUserId){
                        console.log(ourUserId + " not equal to " + tokenUID)
                        const errString = "SOCKET NEW-MESSAGE ERROR #2: Access Denied";
                        console.log(errString);
                        socket.emit('error', {message:errString});
                    }else{
                        // broadcast message for our room
                        console.log("Users: ", ourUsername + " is sending: " + msg + " for room: " + ourRoomId);
                        const sendStr = `${ourUsername}:  ${msg}`;
                        io.to(ourRoomId.toString()).emit("new-message", {message: sendStr})
                    }
                }
            });


            /*
            * Handler function that will handle a disconnect event.
            * Will emit a disconnect new-message to the room if success.
            * Otherwise will trigger error event with error message.
            */
            socket.on('disconnect', async function(){
                // start by checking the userId and roomId are set (user has connected)
                if(ourRoomId === -1 || ourUserId === -1){
                    socket.emit('error', {message:"SOCKET DISCONNECT ERROR #1: User must connect before disconnecting."});
                }else{
                    // TODO: Want to use token validation to ensure that a user cannot close a connection for someone else,
                    //       But worried that this might prevent someone with an expired token from disconnecting.
                    //       Can we force someone to disconnect as their token expires?

                    // make db connection and remove the user from the room
                    let socClient;
                    try{
                        socClient = await DbUtil.connect_client();
                        await roomFuncs.handleLeaveRoom(socClient, ourUserId);
                        socClient.end();
                        console.log(`User with id ${ourUserId} has disconnected`);
                        io.to(ourRoomId.toString()).emit({message:`User with id ${ourUserId} has disconnected`})
                    } catch (err){
                        const errString = "SOCKET DISCONNECT ERROR #2: err";
                        console.log(errString)
                        socket.emit('error', {message:errString});
                    }

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
