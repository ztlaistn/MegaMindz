import React from "react";
import "./styles/Text.css";
import "./styles/Input.css";
import "./styles/Chatroom.css";
import Gamified from "./Gamified.jsx";
import io from "socket.io-client";
import Chat from "./EnterChat"
import VoiceSession from "./VoiceSession";

export default class Chatroom extends React.Component {
    constructor(props) {
        super(props);
        // when state is changed, this component is re-rendered
        this.state = {
            socket: null,
            username: "",
            roomId: null,
            noRoomError: false,
            socketError: false,
            socketErrorMsg: "",
            ourRole: 0,
            setupStart: false,
            setupComplete: false
        };
        // Holds actual peer streams - when changed, there is no re-render
        this.peersRef = [];

        // do not let scoping in function to change
        this.handleSocketError = this.handleSocketError.bind(this);
        this.addPeersRef = this.addPeersRef.bind(this);
        this.removePeersRef = this.removePeersRef.bind(this);
        this.findPeersRefById = this.findPeersRefById.bind(this);
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

        // if no roomId (or roomId is not number), show error message to user
        if (!roomId || !(+roomId)) {
            this.setState({noRoomError: true});
        }else{

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
                            if (!oldThis.state.setupStart){
                                oldThis.state.socket = io.connect("/")
                                oldThis.state.setupStart = true;
                            }

                            let socket = oldThis.state.socket;

                            console.log("Connecting to socket for room " + roomId)
                            // send socket new-user event only if we have both token and roomId
                            socket.on("connect", function() {
                                const connData = {
                                    auth: "Bearer " + sessionStorage.getItem("token"),
                                    roomId: parseInt(roomId) 
                                };
                                console.log("we are connecting")
                                socket.emit("new-user", connData);
                                oldThis.state.setupComplete = true;
                                // oldThis.setState({
                                //     setupComplete: true       
                                // });
                            });

                            // oldThis.state.ourRole = data.role;
                            // oldThis.state.username = sessionStorage.getItem("username");
                            // oldThis.state.roomId = roomId;
                            oldThis.setState({
                                ourRole: data.role,
                                username: sessionStorage.getItem("username"),
                                roomId: roomId,
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

    handleSocketError(msg) {
        this.setState({
            socketError: true,
            socketErrorMsg: msg
        });
    };

    toHome = () => {
        window.location.href = "/home";
    };

    addPeersRef = (peerName, peerId, peer) => {
        this.peersRef.push({
            username: peerName,
            peerId,
            peer,
        });
    }

    removePeersRef = (peerName) => {
        let index = this.peersRef.findIndex(elem => elem.username === peerName);
        this.peersRef.splice(index);
    }

    findPeersRefById = (targetId) => {
        const item = this.peersRef.find(p => p.peerId === targetId);
        return item;
    }

    render() {
        const isError = this.state.noRoomError || this.state.socketError;
        if (isError) {
            const errorMsg = this.state.noRoomError ? 'Error: You have not joined a valid room' : this.state.socketErrorMsg;
            return (
                <div class="chatroom-container">
                    <h1 class="title-font">{errorMsg}</h1>
                    <input type="button" value="Return to Home" className="button-primary" onClick={this.toHome}/>
                </div>
            );
        }

        // Temp page when socket setup not complete
        if (!this.state.setupStart){
            return (
                <div class="chatroom-container">
                    <h1 class="title-font">{"Connecting You To Chatroom."}</h1>
                    <input type="button" value="Return to Home" className="button-primary" onClick={this.toHome}/>
                </div>
            );
        }

        return (
            <div class="chatroom-container">
                <div class="chatroom">
                    <Gamified socket={this.state.socket} username={this.username}/>
                    <Chat socket={this.state.socket} username={this.username} handleSocketError={this.handleSocketError} role = {this.state.ourRole} roomId={this.state.roomId}/>
                    <VoiceSession 
                        videoEnabled={false} 
                        socket={this.state.socket} 
                        peersRef={this.peersRef}
                        addPeersRef={this.addPeersRef}
                        removePeersRef={this.removePeersRef}
                        findPeersRefById={this.findPeersRefById}
                    />
                </div>
            </div>
        );
    }
}
