import React from "react";
import "./styles/Input.css";
import "./styles/Chatroom.css";
import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";
import io from "socket.io-client";
import Chat from "./EnterChat"
let socket = io.connect("http://localhost:5001/")
export default class Chatroom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: ""
        };
    }

    componentDidMount() {
        let temp = this
        if(sessionStorage.getItem("token") == null){
            window.location.href = "login";
        } else {
            temp.setState({
                  username: sessionStorage.getItem("username")

            });
        }
        socket.on("connect",function() {
            socket.emit("new-user",temp.state.username);
            console.log("this is line 29")
        });

    }


    sendMessage = () => {
        window.location.href = "/";
    };

    render() {
        return (
            <div>
            <img src={chatroom_character} className="chatroom-character" alt=""/>
            <div class="chatroom">
                <img src={chatroom_background} className="chatroom-background" alt=""/>

                    <Chat socket={socket} username={this.username} />


            </div>
            </div>
        );
    }
}
