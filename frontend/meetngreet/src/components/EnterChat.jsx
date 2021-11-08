import React, {useState,useEffect} from "react";
import "./styles/Input.css";
import "./styles/Chatroom.css";
import socketIOClient from "socket.io-client"; 

import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";

export default function Chat({socket, username, handleSocketError}) {

    const [connected, setConnected] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("")
    const [messages, setMessages] = useState([]);

    const sendMessage = async () =>{
        if (currentMessage!== "") {
            const sendData = {
                auth: "Bearer " + sessionStorage.getItem("token"),
                msg: currentMessage
            }

            await socket.emit("new-message", sendData)
            document.getElementById("message").value = ""
        }
    }

    useEffect(() => {
        if(socket){
            // NEW MESSAGE EVENT
            socket.on("new-message",(data)=>{
                const {message} = data
                setMessages((list) =>[...list,message])
                const msgView = document.getElementById("chat-messages");
                msgView.scrollTop = msgView.scrollHeight;
            });
            // ERROR EVENT
            socket.on("error", (data)=>{
                // update state in parent component
                const msg = "An error occured with the chatroom";
                handleSocketError(msg);
            });
        }
    },[socket]);


    return (
        <div>
            {/*{joinRoom}*/}

                <div class="chatroom-card-frame">
                    <div id="chat-messages" className="chat-messages">
                        {messages.map((message_data)=>{
                            return <p class="m" >{message_data}</p>
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