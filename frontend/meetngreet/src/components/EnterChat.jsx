import React, {useState,useEffect} from "react";
import "./styles/Input.css";
import "./styles/Chatroom.css";
import socketIOClient from "socket.io-client";

import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";

export default function Chat({socket, username}) {

    const [connected, setConnected] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("")
    const [messages, setMessages] = useState([])
    console.log("it was here12")
    const sendMessage = async () =>{
        console.log(currentMessage)
        if (currentMessage!== "") {
            // const messageData = {
            //     message: currentMessage,
            //     user: username
            // }
            console.log(currentMessage)

            await socket.emit("new-message", currentMessage)
        }
    }

    useEffect(() => {
        console.log("use Effect")
        socket.on("new-message",(data)=>{
            console.log(data)
            console.log("it was here line 31")
            setMessages((list) =>[...list,data])
        })
    },[socket]);
    //
    // let joinRoom = () =>{
    //     console.log("user connected")
    //     socket.emit("new-user", "mana");
    //
    // }

    return (
        <div>
            {/*{joinRoom}*/}

                <div class="chatroom-card-frame">
                    <div id="chat-messages" className="chat-messages">
                        {messages.map((message_data)=>{
                            return <p>{message_data}</p>
                        })}

                    </div>

                    <input type="text" required id="message" name="message" placeholder="Start Chatting..." onChange={(event)=>
                        setCurrentMessage(event.target.value)
                    }/>
                    <input type="button" value="Send Message" className="button-primary" onClick={sendMessage}/>
                </div>

        </div>
    );

}