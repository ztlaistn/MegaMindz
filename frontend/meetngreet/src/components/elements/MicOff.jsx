import React from "react";
import MicOff from "../../assets/mic-off.svg";
import "../styles/Button.css";

const MicOffButton = (props) => {
    return(
        <button type="button" class="mute-button mic-off" onClick={props.onClick}>
            <img src={MicOff} alt="Microphone Off" />
        </button>
    );
}

export default MicOffButton;