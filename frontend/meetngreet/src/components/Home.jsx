import React from "react";
import "./styles/Input.css";
import "./styles/Home.css";

import sample_profile from "../assets/sample-profile.png";
import login_icon from "../assets/login_icon.png";
import {Link, Redirect} from "react-router-dom";

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: "",
            roomId: "",
            videoRoomId: ""
        };
    }
    change_Handler(field, e) {
        console.log("field change");
        this.setState({
            [field]: e.target.value
        });
    };
    componentDidMount() {
        if(sessionStorage.getItem("token") == null){
            window.location.href = "login";
        } else {
            this.setState({
                  username: sessionStorage.getItem("username")
            });
        }
    }

    toUserAccount = () => {
        window.location.href = "user-account";
    };

    toChatroom = () => {
        if(document.getElementById("code").value === ""){
            //Send to default chat room
            window.location.href = "chatroom";
        } else {
            //Send to chat room with specified code
            window.location.href = "chatroom/" + document.getElementById("code").value;
        }
    };

    toVideoRoom = () => {
        sessionStorage.setItem("roomId", this.state.videoRoomId);
        window.location.href = "/videoroom";
    };


    create_room = event => {
        //keep the form from actually submitting
        event.preventDefault();

        if(sessionStorage.getItem("token") == null){
            window.location.href = "login";
        } else {
            //console.log("This is us2: ", this)
            fetch("/room/createRoom", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                }
            }).then(
                function(response){
                    //console.log("This is us3: ", this);
                    if(response.status !== 200){
                        response.json().then(function(data) {
                            console.log(data);
                            window.alert("Error: Failed to Create Room : " + data.message);
                        });
                    }else{
                        //console.log("This is us4: ", this);
                        response.json().then(function(data) {
                            console.log(data);
                            sessionStorage.setItem("roomId", data.roomId);
                            window.location.href = "/chatroom";

                        });
                    }
                }
            ).catch(function(err) {
                console.log('Fetch Error :-S', err);
                window.location.href = "/";
            });
        }

    };
    join_room = event => {
        //keep the form from actually submitting
        event.preventDefault();
        let temp = this
        console.log(temp.state.roomId)
        if (!(+temp.state.roomId)){
            window.alert("Error: Room number entered is not a valid number (digits 0-9)");
            window.location.href = "/";
        }else{
            if(sessionStorage.getItem("token") == null){
                window.location.href = "login";
            } else {
                console.log(sessionStorage)
                //console.log("This is us2: ", this)
                fetch("/room/joinRoom", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                    },
                    body: JSON.stringify({
                           roomId:parseInt(temp.state.roomId)
                    })
                }).then(
                    function(response){
    
                        if(response.status !== 200){
                            response.json().then(function(data) {
                                console.log(data);
                                window.alert("Error: Failed to Join Room : " + data.message);
                            });
                        }else{
                            //console.log("This is us4: ", this);
                            response.json().then(function(data) {
                                console.log(temp.state.roomId);
                                console.log(data);
                                sessionStorage.setItem("roomId", temp.state.roomId);
                                window.location.href = "/chatroom";
    
                            });
                        }
                    }
                ).catch(function(err) {
                    console.log('Fetch Error :-S', err);
                    window.location.href = "/";
                });
            }
        }
        
    };


    render() {
        return (
            <div id="home">
                <img src={sample_profile} className="profile-picture" alt=""/>
                <br/>
                <b>Welcome back, {this.state.username}</b>
                <br/>
                <input type="button" value="User Account" className="button-primary" onClick={this.toUserAccount}/>
                <br/>
                <input type="button" value="Create Room" className="button-primary" onClick={this.create_room}/>
                <br/>
                {/*<input type="text" required id="code" name="message" placeholder="Enter Room code" on/>*/}
                <label className="Enter room code">
                    Enter room code
                    <input
                        type="text"
                        onChange={e => this.change_Handler("roomId", e)}
                        value={this.state.roomId}
                        onKeyDown={(event)=> {
                            if(event.key === "Enter") {
                                this.join_room();
                            };
                        }}
                    />
                </label>
                <input type="button" value="Join Chat Room" className="button-primary" onClick={this.join_room}/>

                <br />

                <label className="Enter VIDEO room code">
                    Enter room code
                    <input
                        type="text"
                        onChange={e => this.change_Handler("videoRoomId", e)}
                        value={this.state.videoRoomId}
                        onKeyDown={(event)=> {
                            if(event.key === "Enter") {
                                this.toVideoRoom();
                            };
                        }}
                    />
                </label>
                <input type="button" value="Join Video Room" className="button-primary" onClick={this.toVideoRoom}/>
            </div>
        );
    }
}
