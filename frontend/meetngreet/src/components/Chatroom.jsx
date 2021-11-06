import React from "react";
import "./styles/Text.css";
import "./styles/Input.css";
import "./styles/Chatroom.css";
import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";
import Gamified from "./Gamified.jsx";
import io from "socket.io-client";
import Chat from "./EnterChat"

//let socket = io.connect("/")
export default class Chatroom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: io.connect("/", {forceNew: true}),
            username: "",
            roomId: null,
            noRoomError: false,
            ourRole: 0,
        };
    }

    componentDidMount() {
        // if no token, redirect to login page
        let oldThis = this
        if(sessionStorage.getItem("token") == null){
            console.log("no token")
            window.location.href = "login";
        } 

        // get roomId
        const roomId = sessionStorage.getItem("roomId");

        console.log("Socket before fetch")
        console.log(oldThis.state.socket)

        console.log(roomId)

        // if no roomId (or roomId is not number), show error message to user
        if (!roomId || !(+roomId)) {
            this.setState({noRoomError: true});
            window.alert("Error: Failed to join room, no roomID");
        }else{
            // console.log("Connecting to socket for room " + roomId)
            // oldThis.setState({roomId: roomId});
            // let socket = oldThis.state.socket;
            // socket.on("connect",function() {
            //     const connData = {
            //         auth: "Bearer " + sessionStorage.getItem("token"),
            //         roomId: parseInt(roomId) 
            //     };
            //     socket.emit("new-user", connData);
            // });
            fetch('/room/joinRoom', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                },
                body: JSON.stringify({
                    roomId: parseInt(roomId)
                })
            }).then(
                function(response){                    
                    if(response.status !== 200){
                        response.json().then(function(data){
                            console.log(data);
                            window.alert("Error: Failed to Join room: " + data.message);
                            window.location.href = "/";
                        });
                    }else{
                        response.json().then(function(data){
                            let socket = oldThis.state.socket;
                            console.log("socket in func: \n");
                            console.log(socket);

                            console.log("Connecting to socket for room " + roomId)
                            // send socket new-user event only if we have both token and roomId
                            socket.on("connect", function() {
                                const connData = {
                                    auth: "Bearer " + sessionStorage.getItem("token"),
                                    roomId: parseInt(roomId) 
                                };
                                console.log("we are connecting")
                                socket.emit("new-user", connData);
                            });

                            oldThis.setState({
                                ourRole: data.role,
                                username: sessionStorage.getItem("username"),
                                roomId: roomId
                            });
                        });
                    }
                }
            ).catch(function(err){
                console.log('Fetch Error: -S', err);
                oldThis.setState({ourRole: -1, roomId: null})
                window.location.href = "/";
            });
        }
        

        
    }

    toHome = () => {
        window.location.href = "home";
    };



    sendMessage = () => {
        window.location.href = "/";
    };

    render() {
        console.log(this.state.noRoomError);
        if (this.state.noRoomError) {
            return (
                <div class="chatroom-container">
                    <h1 class="title-font">Error: You have not joined a valid room</h1>
                    <input type="button" value="Return to Home" className="button-primary" onClick={this.toHome}/>
                </div>
            )
        }
        console.log("socket in render: \n");
        console.log(this.state.socket);
                
        return (
            <div class="chatroom-container">
                <h1 class="title-font">Room Code:  <b>{this.state.roomId}</b></h1>
                <div class="chatroom">
                    <Gamified/>
                    <Chat socket={this.state.socket} username={this.username} />
                </div>
            </div>
        );
    }
}
