import React from "react";
import "./styles/ModalMenu.css";
import './styles/NavigationBar.css'

export default class ModalMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: "",
          roomId: null,
          noRoomError: false,
          users: [],
          usersLoaded: false,
        };
    }
    onClose = e => {
        this.props.onClose && this.props.onClose(e);
    };
    render() {
        if (!this.props.show) {
            return null;
        }
        return (
            <div id="modal">
                <iframe src="chatroom-users" width="750" height="400"></iframe>
                <input type="button" value="Close" className="button-primary" onClick={this.onClose}/>
            </div>
        );
    }
}