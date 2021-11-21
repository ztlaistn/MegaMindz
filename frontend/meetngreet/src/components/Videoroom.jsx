import React from "react";
import io from "socket.io-client";
import "./styles/Text.css";
import "./styles/Input.css";
import VoiceSession from "./VoiceSession";


//let socket = io.connect("/")
export default class Videoroom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket: null,
            username: "",
            roomId: null,
            noRoomError: false,
            setup: false
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

        // if no roomId (or roomId is not number), show error message to user
        if (!roomId || !(+roomId)) {
            this.setState({noRoomError: true});
        } else {
            // if socket has not yet been setup
            if (!oldThis.state.setup){
                // then init the socket
                const socket = io.connect("/")
                socket.emit("video room");
                oldThis.setState({
                    setup: true,
                    socket
                });
            }
        }
    }

    toHome = () => {
        window.location.href = "/home";
    };

    render() {
        if (this.state.noRoomError) {
            const errorMsg = 'Error: You have not joined a valid room';
            return (
                <div class="videoroom-container">
                    <h1 class="title-font">{errorMsg}</h1>
                    <input type="button" value="Return to Home" className="button-primary" onClick={this.toHome}/>
                </div>
            );
        }

        return (
            <div class="videoroom-container">
                <div class="videoroom">
                    <VoiceSession videoEnabled={true} socket={this.state.socket}  />
                </div>
            </div>
        );
    }
}
