import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import MediaPlayer from "./MediaPlayer";

// constraints currently not in use, feel free to use for future development
const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const VoiceSession = (props) => {
    const [peers, setPeers] = useState([]); // used for rendering video
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]); // Holds actual peer streams
    const roomId = sessionStorage.getItem("roomId");

    useEffect(() => {
        socketRef.current = io.connect("/");
        socketRef.current.emit("video room");
        navigator.mediaDevices.getUserMedia({ video: props.videoEnabled, audio: true }).then(stream => {
           userVideo.current.srcObject = stream;
           socketRef.current.emit("join room", roomId);

           socketRef.current.on("all users", users => {
                /* This array is for rendering purposes */
                const peers = [];
                users.forEach(userId => {
                    const peer = createPeer(userId, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerId: userId,
                        peer,
                    });
                    peers.push(peer);
                });
                setPeers(peers);
           });

           socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerId : payload.callerID,
                    peer,
                });
                
                setPeers( users => [...users, peer]);
           });

           socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerId === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, []);

    /* Function: Call another user in the room, send part 1 of 2 part handshake 
    You send a signal to them with your stream, and expect part 2 of the handshake in the "receiving returned signal" event
    * @param userToSignal: The user you want to call
    * @param callerId: Your callerID
    * @param stream: Your stream
    */
    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true, // we initiated our stream
            trickle: false,
            stream
        });
        // signal event fired immediately cuz initiator: true
        peer.on("signal", signal => {
            // send your callerID and signal to the other user via our signaling server
            socketRef.current.emit("sending signal", {userToSignal, callerID, signal});
        });

        return peer;
    }


    /* accept someone else's call */
    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false, // we don't initiate their stream
            trickle: false,
            stream
        });
        // not fired immediately, 
        // it fires when we accept other user's signal (*)
        // then we return our signal back to them
        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", {signal, callerID});
        });

        // (*) accept their signal here
        peer.signal(incomingSignal);

        return peer;
    }

    const mediaText = props.videoEnabled ? "Video" : "Audio";
    const ourMediaPlayer = props.videoEnabled
                                ? (<video muted ref={userVideo} autoPlay playsInline />)
                                : (<audio muted ref={userVideo} autoPlay />);
    return (
        <div>
            <h1>{`${mediaText} Room`}</h1>

            {/* Add our media player */}
            {ourMediaPlayer}

            {/* Add other users' media players */}
            {peers.map((peer, index) => {
                return (
                    <MediaPlayer key={index} peer={peer} videoEnabled={props.videoEnabled}/>
                );
            })}
        </div>
    );
};

export default VoiceSession;