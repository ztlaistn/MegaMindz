import React from "react";
import "./styles/ModalMenu.css";
import './styles/NavigationBar.css'

export default class ModalMenu extends React.Component {
    constructor(props) {
        super(props);
    }
    onClose = e => {
        this.props.onClose && this.props.onClose(e);
    };
    render() {
        if (!this.props.show) {
            return null;
        }
        if (this.props.menu) {
        return (
            <div id="modal">
                <iframe src="chatroom-users" width="750" height="400"></iframe>
                <input type="button" value="Close" className="button-primary" onClick={this.onClose}/>
            </div>
        );
        }
        else {
            return (
                <div id="modalhelp">
                <h1>Meet N Greet</h1><br/>
                <h2>Help Menu</h2><br/>
                <h3>General Usage:</h3><br/>
                Click on an area on a map to move there<br/>
                As you approach other users, their name will change color as you enter the audible range.<br/>
                You can mute all others by clicking "Menu", then "Toggle Audio"<br/>
                You can mute your microphone by clicking the "Mute" button.<br/>
                You can talk to everybody in the room using the text chat in the middle right area.<br/>
                You can share the room code that appears at the top with other people.<br/>
                You can see all the other users in the room by clicking "Menu", then "Users in Room"<br/>
                <br/>
                <h3>Administration:</h3><br/>
                If you have elevated permissions in this room you can access "Menu", then "Admin Options".<br/>
                This will allow you to adminstrate the users in the room.<br/>
                <input type="button" value="Close" className="button-primary" onClick={this.onClose}/>
            </div>
            )
        }
    }
}