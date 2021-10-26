import React from "react";
import "./styles/Login.css";
import "./styles/Input.css";
import login_icon from "../assets/login_icon.png";
import socketIOClient from "socket.io-client";


export default class Chatroom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            empty_email: false,
            empty_password: false,
            response:""

        };
    }
    componentDidMount() {
        const socket = socketIOClient("/");


        socket.on("connect",function() {
            console.log('Client has connected to the server!');
            console.log(sessionStorage.getItem("username"));

            this.response = socket.emit("new-user", sessionStorage.getItem("username"));
            console.log(this.response);


        });

    }


    render() {
        return (
            <div id="login-form">
                <div className="login-credentials">
                    <p>
                        {this.state.response}
                    </p>
                </div>
            </div>
        );
    }
}