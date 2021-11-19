import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}

const Audio = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <audio autoPlay ref={ref} />
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = (props) => {
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
        // not fired immediately, we send our signal back to them
        // it fires when we accept their signal (#1)
        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", {signal, callerID});
        });

        // accept their signal here
        peer.signal(incomingSignal);

        return peer;
    }

    if (props.videoEnabled){
        return (
            <div>
                <h1>Video Room</h1>
                <StyledVideo muted ref={userVideo} autoPlay playsInline />
                {peers.map((peer, index) => {
                    return (
                        <Video key={index} peer={peer} />
                    );
                })}
            </div>
        );
    } else {
        return (
            <div>
                <h1>Audio Room</h1>
                <audio ref={userVideo} autoPlay />
                {peers.map((peer, index) => {
                    return (
                        <Audio key={index} peer={peer} />
                    );
                })}
            </div>
        );
    }
};

export default Room;