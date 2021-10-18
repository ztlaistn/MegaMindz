import React from "react";
import "./styles/Input.css";
import "./styles/Home.css";

import sample_profile from "../assets/sample-profile.png";
import login_icon from "../assets/login_icon.png";

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: ""
        };
    }

    componentDidMount() {
        // first fetch the user data to allow update of username
        if(sessionStorage.getItem("token") != null){
            window.location.href = "login";
        } else {
            fetch(this.url+"/auth/fetchUserAccount", {
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                }
            })
                .then(res => res.json())
                .then(
                    result => {
                        if (result) {
                            console.log(result);
                            this.setState({
                                username: result.username || ""
                            })
                        }
                    },
                    error => {
                        alert("error!");
                    }
                );
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
            </div>
        );
    }
}
