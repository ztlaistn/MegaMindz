import React from "react";
import "./styles/Input.css";
import "./styles/Chatroom.css";
import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";

export default class Chatroom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: ""
        };
    }

    componentDidMount() {
        if(sessionStorage.getItem("token") == null){
            window.location.href = "login";
        } else {
            this.setState({
                  username: sessionStorage.getItem("username")
            });
        }
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
                <div class="chatroom-card-frame">
                    <div id="chat-messages" class="chat-messages"></div>
                    <input type="text" required id="message" name="message" placeholder="Message"/>
                    <input type="button" value="Send Message" className="button-primary" onClick={this.sendMessage}/>
                </div>
            </div>
            </div>
        );
    }
}
