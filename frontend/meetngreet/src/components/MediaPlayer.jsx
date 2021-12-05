import React, { useEffect, useRef } from "react";
import "./styles/Text.css";

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

 if (props.videoEnabled){
        return(
            <div class="video-container">
                <video playsInline autoPlay ref={ref} id={props.id}/>
                {/* Render username under video */}
                <p class="video-name-label title-font">{props.id}</p>
            </div>
        );
    } else{
        return(<audio autoPlay ref={ref} id={props.id}/>);
    }
}

export default MediaPlayer;