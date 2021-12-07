import React from "react";
import MicOn from "../../assets/mic-on.svg";
import "../styles/Button.css";

const MicOnButton = (props) => {
    return(
        <button type="button" class="mute-button mic-on" onClick={props.onClick}>
            <img src={MicOn} alt="Microphone On" />
        </button>
    );
}

export default MicOnButton;