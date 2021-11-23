import React, {useState,useEffect} from "react";
import "./styles/Input.css";
import "./styles/Chatroom.css";
import socketIOClient from "socket.io-client"; 

import chatroom_background from "../assets/chatroom-background.jpg";
import chatroom_character from "../assets/chatroom-character.gif";

export default function Chat({socket, username, handleSocketError,role,roomId}) {

    const [connected, setConnected] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("")
    const [messages, setMessages] = useState([]);
    let end_meeting;
    const sendMessage = async () =>{
        if (currentMessage!== "") {
            const sendData = {
                auth: "Bearer " + sessionStorage.getItem("token"),
                msg: currentMessage
            }

            await socket.emit("new-message", sendData)
            document.getElementById("message").value = ""
            setCurrentMessage("")
        }
    }
    const endMeeting = async () =>{
        const sendData = {
            auth: "Bearer " + sessionStorage.getItem("token"),
            roomId: parseInt(roomId)
        }
        console.log("role: " + role)
        await socket.emit("end-meeting", sendData)
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
                console.log(data);
                handleSocketError(msg);
            });
            //TO FORCE END THE ROOM
            socket.on("force-end",()=>{
                sessionStorage.setItem("roomId", "");
                window.location.href = "/";
            });
            // ERROR EVENT DUE TO PERMISSIONS
            socket.on("error-permissions",(data)=>{
                console.log(data);
                window.alert("You are not allowed to do that.");

            });
        }
    },[socket]);
    // to check if the end meeting button should be showed or not.
    if (role>2) {
        end_meeting =  <input type="button" value="End Meeting" className="button-primary" onClick={endMeeting}/>;

    } else {
        end_meeting = "";
    }

    return (
        <div>
                <div class="chatroom-card-frame">
                    <div id="chat-messages" className="chat-messages">
                        {messages.map((message_data)=>{
                            return <p class="m" >{message_data}</p>
                        })}
                    </div>

                    <input type="text" required id="message" name="message" placeholder="Start Chatting..." onChange={(event)=>
                        setCurrentMessage(event.target.value)
                    }
                    onKeyDown={(event)=> {
                        if(event.key === "Enter") {
                            sendMessage();
                        };
                    }}/>
                    <input type="button" value="Send Message" className="button-primary" onClick={sendMessage}/>
                    
                    {end_meeting}


                </div>

        </div>
    );

}