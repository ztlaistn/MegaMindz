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
import roomFuncs from "./services/roomFuncs";
import roomPosition from "./services/roomPosition";

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
        this.app.set("io",this.io);
    }

    /* backend routes exist here
    NOTE: will likely need to organize into seperate files as we add more routes*/
    backendRoutes() {
        const rootdir = __dirname.substring(0, __dirname.length-7);
        const root = require('path').join(rootdir, 'frontend', 'meetngreet', 'build')
            this.app.use(express.static(root));
            this.app.get("*", (req, res) => {
                res.sendFile('index.html', { root });
            })

        authRouter(this.app);
        usersRouter(this.app);
        roomRouter(this.app);
    }


    handleSocketConnection() {
        const io = this.io;
        const oldThis = this
        
        // Variables for video room
        const users = {};
        const socketToRoom = {};

        this.io.on("connection", async function (socket) {
            let videoRoom = false;

            /* ------------------ START SIGNALING SERVER FUNCTIONS ------------------*/
            socket.on("video room", () => {
                // use this to disable conflicting events for the chatroom
                // like: disconnect event
                videoRoom = true;
            });

            socket.on("join room", data => {
                const {username, roomId} = data;
                console.log(`${username} is joining room ${roomId}`);
                if (users[roomId]) {
                    /* TO DO: In video room (not chatroom), enforce max 2 video users
                    const length = users[roomID].length;
                    if (length === 4) {
                        socket.emit("room full");
                        return;
                    }
                    */
                    // add non-first user to the correct room
                    users[roomId].push({
                        socketId: socket.id, 
                        callerName: username
                    });
                } else {
                    // Add first user to the correct room
                    users[roomId] = [{
                        socketId: socket.id, 
                        callerName: username
                    }];
                }
                // keep track of which socket ID is in which room
                socketToRoom[socket.id] = roomId;
                console.log("room info:");
                console.log(users[roomId]);
                // get every other user in the room except the joiner
                const usersInThisRoom = users[roomId].filter(elem => elem.socketId !== socket.id);
              
                console.log("Sending them list of users:");
                usersInThisRoom.forEach(element => {
                    console.log(element);
                });
                // send it to the joiner
                socket.emit("all users", usersInThisRoom);
            });

            socket.on("sending signal", payload => {
                console.log(`Original sender: ${socket.id} name: ${payload.username} sending a signal to: ${payload.userToSignal}`);
                io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerId: socket.id, callerName: payload.username });
            });

            socket.on("returning signal", payload => {
                console.log(`Another peer ${socket.id} is returning their signal to: ${payload.callerId}`);
                io.to(payload.callerId).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
            });

            // Disconnect for video room, mixed with disconnect for chat room (with conditional check)

            /* ------------------ END SIGNALING SERVER EVENTS ------------------ */


            /* ------------------ START EVENTS FOR CHATROOM ------------------ */

            // variables for this connection
            let ourUsername;
            let ourUserId = -1;
            let ourRoomId = -1;
            let ourSprite = -1;

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
                    ourSprite = retData.sprite;
                    setupFlag = true;
                } catch (err){
                    console.log(err);
                    socket.emit('error', {message:err});
                }

                if (setupFlag){
                    // If we are here, we can assume we setup correctly
                    // Can do any actions needed for once a user connects to a room
                    roomFuncs.newUserRoomPosition(io, socket, ourRoomId, ourUserId, ourUsername, ourSprite, oldThis.positionDict)
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

            socket.on('request-update-all', function(data){
                const {auth} = data;
                roomFuncs.handleUpdateRequest(socket, ourRoomId, ourUserId, auth, oldThis.positionDict);
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
                }else{
                    videoRoom = false;
                }
                
                // remove reference to that user from the users data structure
                const roomId = socketToRoom[socket.id];
                let room = users[roomId];

                if (room) {
                    // get user's info
                    let leavingUser = room.filter(elem => elem.socketId === socket.id);
                    // remove that user from the room
                    room = room.filter(elem => elem.socketId !== socket.id);
                    users[roomId] = room;
                    // emit to all others users that this person left
                    users[roomId].forEach(user => {
                        io.to(user.socketId).emit('user left', {callerName: leavingUser.callerName});
                    });
                }
            });

            /*
             * Handler that will end a meeting for everyone in the room, if request sent from room owner
             */
            socket.on('end-meeting', async function (data) {
                const {auth,roomId} = data;
                try{
                    await roomFuncs.endMeetingHandler(io, socket, ourUserId, ourRoomId, ourUsername, auth, roomId);
                } catch (err){
                    //errors are already handled in the endMeetingHandler Function
                    console.log(err)
                    console.log("error in end meeting, handled in function");
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
