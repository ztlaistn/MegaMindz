import React, {useState,useEffect} from "react";
import "./styles/Input.css";
import "./styles/Chatroom.css";
import socketIOClient from "socket.io-client";

import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";
import Chat from "./EnterChat"
const socket = socketIOClient("http://localhost:5001");



export default function Chatroom() {

    const [connected, setConnected] = useState('');
    console.log("it was here12")


    useEffect(() => {
        console.log("it was here3")
        socket.on("new-user",(data)=>{
            setConnected(data)
            console.log(data)
            console.log("it was here")
        })
    },[socket]);

    let joinRoom = () =>{
        console.log("user connected")
        socket.emit("new-user", "mana");

    }

    return (
            <div>
                {joinRoom}
                <img src={chatroom_character} className="chatroom-character" alt=""/>
                <div class="chatroom">
                    <img src={chatroom_background} className="chatroom-background" alt=""/>
                    <div class="chatroom-card-frame">
                        <div id="chat-messages" class="chat-messages">
                            <p>"Hello"</p>
                            <p>{setConnected}</p>
                            {/*<p>{this.state.is_connected}</p>*/}

                        </div>
                        <input type="text" required id="message" name="message" placeholder="Message"/>
                        <input type="button" value="Send Message" className="button-primary" />
                    </div>
                </div>
            </div>
        );

}
