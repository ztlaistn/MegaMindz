import React from "react";
import "./styles/Input.css";
import "./styles/Home.css";

import sample_profile from "../assets/sample-profile.png";
import login_icon from "../assets/login_icon.png";
import {Link} from "react-router-dom";

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

    render() {
        return (
            <div id="home">
                <img src={sample_profile} className="profile-picture" alt=""/>
                <br/>
                <b>Welcome back, {this.state.username}</b>
                <br/>
                <input type="button" value="User Account" className="button-primary" onClick={this.toUserAccount}/>
                <Link to ="/chatroom">
                    <input type="text" required id="message" name="message" placeholder="Enter Room code"/>
                <input type="button" value="Join Chat Room" className="button-primary"/>
                </Link>
            </div>
        );
    }
}
