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
                <input type="text" required id="code" name="message" placeholder="Enter Room code"/>
                <input type="button" value="Join Chat Room" className="button-primary" onClick={this.toChatroom}/>
            </div>
        );
    }
}
