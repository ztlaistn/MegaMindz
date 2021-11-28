import React, { useEffect, useRef } from "react";

/* Function Component: Media Player will take the peer stream and attach it to the appropriate HTML element for rendering
* @param props.key: key associated with that peer
* @param props.peer: a Peer object
* @param props.videoEnabled: true or false. Will determine if video or audio only element is rendered.
*/
const MediaPlayer = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    let chosenMedia = props.videoEnabled // if video enabled
                        ? (<video playsInline autoPlay ref={ref} id={props.id}/>) // return video
                        : (<audio autoPlay ref={ref} id={props.id}/>); // else return audio
    return (
        chosenMedia
    );
}

export default MediaPlayer;