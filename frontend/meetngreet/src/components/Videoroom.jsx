import React, {createRef} from "react";
import io from "socket.io-client";
import "./styles/Text.css";
import "./styles/Input.css";
import VoiceSession from "./VoiceSession";


//let socket = io.connect("/")
export default class Videoroom extends React.Component {
    constructor(props) {
        super(props);
        // when state is changed, this component is re-rendered
        this.state = {
            socket: null,
            username: "",
            roomId: null,
            noRoomError: false,
            setup: false
        };
        // Holds actual peer streams - when Ref is changed, there is no re-render
        this.peersRef = [];

        // do not let scoping in function to change
        this.addPeersRef = this.addPeersRef.bind(this);
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
        } else {
            // if socket has not yet been setup
            if (!oldThis.state.setup){
                // then init the socket
                const socket = io.connect("/")
                socket.emit("video room");
                oldThis.setState({
                    setup: true,
                    socket,
                    roomId
                });
            }
        }
    }

    toHome = () => {
        window.location.href = "/home";
    };

    addPeersRef = (peerId, peer) => {
        this.peersRef.push({
            peerId,
            peer,
        });
    }

    findPeersRefById = (targetId) => {
        const item = this.peersRef.find(p => p.peerId === targetId);
        return item;
    }

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
                    <VoiceSession 
                        videoEnabled={true} 
                        socket={this.state.socket} 
                        peersRef={this.peersRef}
                        addPeersRef={this.addPeersRef}
                        findPeersRefById={this.findPeersRefById}
                    />
                </div>
            </div>
        );
    }
}
