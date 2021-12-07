import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import MediaPlayer from "./MediaPlayer";
import MicOnButton from "./elements/MicOn";
import MicOffButton from "./elements/MicOff";
import "./styles/Text.css";

// constraints currently not in use, feel free to use for future development
const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

/* Functional Component: Sets up the voice session by using Peer objects and rendering their streams in HTML elements
* @param videoEnabled: true/false - whether to render video/audio or audio only
* @param socket: The socket object
* @param addPeersRef: Function that adds a new peer to the parent's state
* @param findPeersRefById: Function that locates peer ref from parent state using specified id
*/
const VoiceSession = ({videoEnabled, socket, addPeersRef, removePeersRef, findPeersRefById}) => {
    // peers array used for rendering each peer as MediaPlayer component (useState causes a re-render on change)
    const [peers, setPeers] = useState([]); 
    const [muted, changeMutedState] = useState(false);
    const socketRef = useRef();
    const ourMedia = useRef();
    const muteButton = useRef();
    const username = sessionStorage.getItem("username");


    // detect changes to the web socket
    useEffect(() => {
        if (socket) {
            socketRef.current = socket;
            navigator.mediaDevices.getUserMedia({ video: videoEnabled, audio: true }).then(stream => {
                ourMedia.current.srcObject = stream;

                const data = {username, roomId: sessionStorage.getItem("roomId")};
                socketRef.current.emit("join room", data);
                console.log("join room event sent");

                socketRef.current.on("all users", users => {
                        const peers = [];
                        users.forEach(user => {
                            const {socketId, callerName} = user; // here we get the caller's name
                            const peer = createPeer(socketId, username, stream);
                            /* Add peer stream to state in parent component */
                            addPeersRef(callerName, socketId, peer);
                            /* Add peer to temp array */
                            peers.push({peer: peer, username: callerName});
                        });
                        /* Set array to temp array for rendering purposes */
                        setPeers(peers);
                });

                socketRef.current.on("user joined", payload => {
                        console.log("Attempting to connect to: "+ payload.callerName);
                        const peer = addPeer(payload.signal, payload.callerId, stream);
                        
                        /* Add peer stream to state in parent component */
                        addPeersRef(payload.callerName, payload.callerId, peer);
                        
                        /* add this peer to rendering array */
                        setPeers( users => [...users, {peer: peer, username: payload.callerName}]);
                });

                socketRef.current.on("receiving returned signal", payload => {
                        const item = findPeersRefById(payload.id);
                        item.peer.signal(payload.signal);
                });

                socketRef.current.on("user left", payload => {
                    console.log("removing peer "+ payload.callerName);
                    removePeersRef(payload.callerName);
            });
            });
        }
    }, [socket]);

    /* Function: Call another user in the room, send part 1 of 2 part handshake 
    You send a signal to them with your stream, and expect part 2 of the handshake in the "receiving returned signal" event
    * @param userToSignal: The user you want to call
    * @param username: Your username
    * @param stream: Your stream
    */
    function createPeer(userToSignal, username, stream) {
        const peer = new Peer({
            initiator: true, // we initiated our stream
            trickle: false,
            stream
        });
        // signal event fired immediately cuz initiator: true
        peer.on("signal", signal => {
            // send your callerId and signal to the other user via our signaling server
            socketRef.current.emit("sending signal", {userToSignal, username, signal});
        });

        return peer;
    }


    /* accept someone else's call */
    function addPeer(incomingSignal, callerId, stream) {
        const peer = new Peer({
            initiator: false, // we don't initiate their stream
            trickle: false,
            stream
        });
        // not fired immediately, 
        // it fires when we accept other user's signal (*)
        // then we return our signal back to them
        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", {signal, callerId});
        });

        // (*) accept their signal here
        peer.signal(incomingSignal);

        return peer;
    }

    function toggleMute() {
        // toggle
        ourMedia.current.srcObject.getAudioTracks()[0].enabled = !ourMedia.current.srcObject.getAudioTracks()[0].enabled;
        // change value of mute button
        //muteButton.current.value = muteButton.current.value == "Mute" ? "Unmute" : "Mute";
        changeMutedState(!muted);
    }

    function leaveRoom() {
        window.location.href = "/";
    }

    const ourMediaPlayer = videoEnabled
                                ? (<div class="video-container"><p class="video-name-label title-font">{sessionStorage.getItem("username")}</p><video muted id="our-media-device" ref={ourMedia} autoPlay playsInline /></div>) // if true
                                : (<audio muted id="our-media-device" ref={ourMedia} autoPlay />); // if false

    const videoToolBar = videoEnabled
                                ? (
                                    <div class="video-toolbar">
                                        {muted ? <MicOffButton onClick={toggleMute} /> : <MicOnButton onClick={toggleMute} /> }
                                        <input type="button" value="Leave Room" className="button-primary leave-room-button" onClick={leaveRoom}/>
                                    </div>
                                ) : null;
    return (
        <div class="media-container">
            <div class="media">
                {/* Add our media player */}
                {ourMediaPlayer}
                {/* Add other users' media players */}
                {peers.map(peerInfo => {
                    return (
                        <MediaPlayer id={peerInfo.username} peer={peerInfo.peer} videoEnabled={videoEnabled}/>
                    );
                })}
            </div>
            {/* Add buttons menu for video */}
            {videoToolBar}
        </div>
    );
};

export default VoiceSession;