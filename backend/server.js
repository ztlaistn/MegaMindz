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
import roomPosition from "./roomPosition";

class Server {
    httpServer;
    app;
    io;

    PORT = process.env.PORT || 5001;
    HOST = '0.0.0.0';

    // Initializes a dictionary to keep track of player positions in the rooms
    // Dict will hold key value pairs where the key is the roomId and the value is a roomPosition object
    positionDict = {}

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
        const oldThis = this

        let videoRoom = false;
        const users = {};
        const socketToRoom = {};

        this.io.on("connection", async function (socket) {

            /* START SIGNALING SERVER FUNCTIONS */
            socket.on("video room", () => {
                console.log("The user entered the video room")
                videoRoom = true;
            });
                
            socket.on("join room", roomID => {
                console.log("video room value:")
                console.log(videoRoom)
                if (users[roomID]) {
                    /*
                    const length = users[roomID].length;
                    if (length === 4) {
                        socket.emit("room full");
                        return;
                    }
                    */
                    users[roomID].push(socket.id);
                    console.log("Adding a non-first user {" +socket.id + "} to the room: "+roomID);
                } else {
                    users[roomID] = [socket.id];
                    console.log("Adding a first user {" +socket.id + "} to the room: "+roomID);
                }
                socketToRoom[socket.id] = roomID;
                const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

                console.log("Sending this user {"+socket.id+"} the list of all users:");
                usersInThisRoom.forEach( user => console.log(user));
                
                socket.emit("all users", usersInThisRoom);
            });

            socket.on("sending signal", payload => {
                console.log("Original sender: {"+ payload.callerID + "} sending a signal to: {" + payload.userToSignal + "}");
                io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
            });

            socket.on("returning signal", payload => {
                console.log("Another peer {" + socket.id + "} is returning their signal to: {" + payload.callerID + "}");
                io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
            });

            socket.on('disconnect', () => {
                console.log("Socket {"+socket.id + "} disconnected");
                const roomID = socketToRoom[socket.id];
                let room = users[roomID];
                if (room) {
                    room = room.filter(id => id !== socket.id);
                    users[roomID] = room;
                }
            });
            /* END SIGNALING SERVER EVENTS */

            
            /* START EVENTS FOR CHATROOM */

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
                    // If we are here, we can assume we setup correctly
                    // Can do any actions needed for once a user connects to a room
                    roomFuncs.newUserRoomPosition(io, socket, ourRoomId, ourUserId, ourUsername, oldThis.positionDict)
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
            * Handler that will handle a new move relay event
            * Will emit this data to others in the room 
            */
            socket.on('new-move', function(data){
                const {auth, move} = data;
                roomFuncs.relayPositionMove(io, socket, ourUserId, ourRoomId, ourUsername, oldThis.positionDict, move, auth);
            });

            /*
            * Handler function that will handle a disconnect event.
            * Will emit a disconnect new-message to the room if success.
            * Otherwise will trigger error event with error message.
            */
            socket.on('disconnect', async function(){
                if (!videoRoom) {
                // start by checking the userId and roomId are set (user has connected)
                try{
                    await roomFuncs.socketDisconnectEvent(io, socket, ourUserId, ourRoomId, ourUsername);
                } catch (err){
                    console.log(err);
                    socket.emit('error', {message:err})
                }

                // if we got here, we removed the user from the room in the database just fine
                // now we can remove (make not visible) them from the position dict and let everyone else in the room know.
                roomFuncs.disconnectRoomPosition(io, socket, ourUserId, ourRoomId, ourUsername, oldThis.positionDict);
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
