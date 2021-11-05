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

    /*
     * Function to validate the tocken passed to socket connection.
     * Parameters:
     *      token_data: token passed from socket function in the same way it is passed to backened routes from frontend.
     *                  This means that it will be "bearer <token data>"
     * Returns:
     *      If valid, will return the userId
     *      If invalid, will return -1
     */
    validateSocketToken(token_data){
        if(!token_data){
            return -1;
        }

        const token = token_data.split(" ")[1];
        try{
            const data = jwt.verify(token, process.env.TOKEN_SECRET);
            const retVal = data.userId;
        } catch (err){
            return -1;
        }
    }

    /*
     * Function that will handle DB issues regarding leaving a room.
     * Very similar to the /leaveRoom backend route
     * Parameters:
     *   client: client object connected to the database
     *   userId: user_id DB value for the user trying to leave a room
     *
     * Returns:    A Promise which wiil
     *             Resolve with userId when a user leaves a room correctly
     *             Reject with error message if there is any error
     */
    async handleLeaveRoom(client, userId) {
        // remove them from the room
        try{
            await DbUtil.set_field_for_user_id(client, userId, "curr_room", null);
            client.end();
            return new Promise((resolve, reject) => {
                resolve(userId);
            });
        } catch (err){
            const errString = "LEAVE ROOM CLIENT ERROR #2:" + err
            client.end()
            console.log(errString);
            return new Promise((resolve, reject)=>{
                reject(errString);
            });
        }
    }

    handleSocketConnection() {
        const io = this.io;
        this.io.on("connection", async function (socket) {
            // variables for this connection
            let ourUsername;
            let ourUserId = -1;
            let ourRoomId = -1;

            console.log("Socket connected.");
            console.log("custom message.");
            socket.emit('new-message', 'Connection established with server');

            /*
            * Handler function that will handle a new user event.
            * Parameters:
            *   - data object includes
            *       - token: user's session token
            *       - roomId: room they are trying to connect to (this must be a number)
            * Will emit a new user new-message to the room if success.
            * Otherwise will trigger error event with error message.
            */
            socket.on("new-user", async function (data) {
                const {auth, roomId} = data //should we be getting the token from the header?
                let client;
                let errString;

                const tokenUID = 1; //this.validateSocketToken(auth);
                if (tokenUID < 0){
                    errString = "SOCKET NEW-USER ERROR #0: Access Denied";
                    console.log(errString);
                    socket.emil('error', {message:errString});
                }else{
                    // set our_userId based on the packet
                    ourUserId = tokenUID;
                    // connect a client to the database
                    try{
                        client = await DbUtil.connect_client()
                    } catch (err){
                        errString = "SOCKET NEW-USER ERROR #1: Couldn't connect to database: " + err;
                        console.log(errString)
                        socket.emit('error', {message:errString})
                    }
                }

                // if we connected, check that the room exists
                if (client){
                    try{
                        const flag = await DbRoll.room_exists(client, roomId);
                        if(flag){
                            row = await DbUtil.select_user_with_id(client, ourUserId)
                            if(row.roomId === roomId){
                                // Everything was correct, set the variables and connect them to the room
                                console.log(`${username} has connected`);
                                ourUsername = row.username;
                                ourRoomId = roomId;
                                socket.to(roomId.toString()).emit('new-message', `${username} has connected`);
                            }else{
                                client.end()
                                errString = "SOCKET NEW-USER ERROR #2: User trying to connect to socket for room they are not in.";
                                console.log(errString);
                                socket.emil('error', {message:errString});
                            }
                        }else{
                            client.end()
                            errString = "SOCKET NEW-USER ERROR #3: User trying to connect to socket for room that doesn't exist.";
                            console.log(errString);
                            socket.emit('error', {message:errString})
                        }
                    } catch (err){
                        client.end()
                        errString = "SOCKET NEW-USER ERROR #4: DB Error: " + err;
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
                // start by checking the userId and roomId are set (user has connected)
                if(ourRoomId === -1 || ourUserId === -1){
                    socket.emit('error', {message:"SOCKET NEW-MESSAGE ERROR #1: User trying to relay message when they are not connected to a room."});
                }else{
                    const tokenUID = validateSocketToken(auth);
                    if (tokenUID < 0 || tokenUID !== ourUserId){
                        errString = "SOCKET NEW-MESSAGE ERROR #2: Access Denied";
                        console.log(errString);
                        socket.emil('error', {message:errString});
                    }else{
                        // broadcast message for our room
                        console.log("Users: ", ourUsername + " is sending: " + msg + " for room: " + ourRoomId);
                        sendStr = `${ourUsername}:  ${msg}`;
                        socket.to(ourRoomId.toString()).emit("new-message", {message: sendStr})
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
                    try{
                        const client = await DbUtil.connect_client();
                        await handleLeaveRoom(client, ourUserId);
                        client.end();
                        console.log(`User with id ${ourUserId} has disconnected`);
                        socket.to(ourRoomId.toString()).emit({message:`User with id ${ourUserId} has disconnected`})
                    } catch (err){
                        client.end();
                        errString = "SOCKET DISCONNECT ERROR #2: err";
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
