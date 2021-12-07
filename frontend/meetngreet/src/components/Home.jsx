import React from "react";
import "./styles/Input.css";
import "./styles/Home.css";

import login_icon from "../assets/login_icon.png";
import {Link, Redirect} from "react-router-dom";
import sample_profile from "../assets/sample-profile.png";
import sprite_one from "../assets/sprite1.png";
import sprite_two from "../assets/sprite2.png";
import sprite_three from "../assets/sprite3.png";
import sprite_four from "../assets/sprite4.png";
import sprite_five from "../assets/sprite5.png";
import sprite_six from "../assets/sprite6.png";


export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: "",
            roomId: "",
            videoRoomId: "",
            sprites_map : {0:sample_profile,1:sprite_one,2:sprite_two,3:sprite_three, 4:sprite_four, 5:sprite_five, 6:sprite_six},
            time: new Date().toLocaleString()
        };
    }

    change_Handler(field, e) {
        console.log("field change");
        this.setState({
            [field]: e.target.value
        });
    };
    componentDidMount() {
        setInterval(() => {
            this.setState({
                time : new Date().toLocaleString()
            })
        }, 1000)
        if(sessionStorage.getItem("token") == null){
            window.location.href = "login";
        } else {
            this.setState({
                  username: sessionStorage.getItem("username")
            });
        }

        let temp_this = this;
        // first fetch the user data to allow update of username
        if(sessionStorage.getItem("token") == null){
            window.location.href = "login";
        } else {
            //console.log("This is us2: ", this)
            fetch("/auth/fetchUserAccount", {
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
                            window.alert("Error: Failed User Account Fetch Code: " + data.message);
                        });
                    }else{
                        //console.log("This is us4: ", this);
                        response.json().then(function(data) {
                            console.log(data);
                            console.log("hii");
                            temp_this.setState({

                                sprite: data.sprite
                            });
                        });
                    }
                }
            ).catch(function(err) {
                console.log('Fetch Error :-S', err);
                window.location.href = "/";
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
        sessionStorage.setItem("roomId", this.state.roomId);
        window.location.href = "/videoroom";
    };
    newVideoRoom = () => {
        sessionStorage.setItem("roomId", Math.floor(Math.random() * 100000));
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
                <div id = "home">
                <img src={this.state.sprites_map[this.state.sprite]} className="profile-picture" alt = "Choose Profile Picture" />
                <header className="date-prompt">{this.state.time}</header>
                <br/>
                    <input type="button" value="User Account" id = "bottom-container" className="button-secondary" onClick={this.toUserAccount} />
                    <br/>
                    <input type="button" value="Create Chat Room" className="button-primary" onClick={this.create_room}/>
                <br/>
                    <input type="button" value="Create Video Room" className="button-primary" onClick={this.newVideoRoom}/>
                    <br/>
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
                <br/>
                <input type="button" value="Join Chat Room" className="chat-button" onClick={this.join_room} />
                <input type="button" value="Join Video Room" className="button-primary" onClick={this.toVideoRoom} />

                </div>

        );
    }
}
