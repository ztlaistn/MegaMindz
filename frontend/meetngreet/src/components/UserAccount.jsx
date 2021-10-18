import React from "react";
import "./styles/Login.css";
import "./styles/Input.css";
import "./styles/UserAccount.css";

import sample_profile from "../assets/sample-profile.png";
import login_icon from "../assets/login_icon.png";

export default class UserAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: "",
            email: "",
            location: "",
            skills: "",
            employment_status : "",
            dob : "",
            url : process.env.SITE_URL
        };
        this.change_Handler.bind(this);
        this.handle_submit.bind(this);
    }

    change_Handler(field, e) {
        console.log("field change");
        this.setState({
            [field]: e.target.value
        });
    };

    handle_submit = event => {
        //keep the form from actually submitting
        event.preventDefault();

        //make the api call to the user controller
        fetch(this.url+"/auth/setUserAccount", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+ sessionStorage.getItem("token")
            },
            body: JSON.stringify({
                "new_values": {

                    username: this.state.username || "",
                    email: this.state.email || "",
                    location: this.state.location || "",
                    skills: this.state.skills || "",
                    employment_status: this.state.employment || ""
                }

            })
        })
            .then(res => res.json())
            .then(
                result => {
                    this.setState({
                        responseMessage: result
                    });
                    window.location.href = "home";
                },
            )


    };

    componentDidMount() {
        // first fetch the user data to allow update of username
        if(sessionStorage.getItem("token") == null){
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
                                username: result.username || "",
                                email: result.email || "",
                                location: result.location|| "",
                                skills: result.skills|| "",
                                employment_status: result.employment || ""

                            })
                        }
                    },
                    error => {
                        alert("error!");
                    }
                );
        }
    }


    render() {
        return (
            <div id="user-account">
                <img src={sample_profile} className="profile-picture" alt=""/>
                <div className="account-credentials">
                    <form onSubmit={this.handle_submit}>
                        <label className="name">
                            Name
                            <input
                                type="text"
                                onChange={e => this.change_Handler("username", e)}
                                value={this.state.username}
                            />
                        </label>
                        <label className="age">
                            Date of Birth
                            <input
                                type="text"
                                onChange={e => this.change_Handler("dob", e)}
                                value={this.state.dob}
                            />
                        </label>
                        <label className="location">
                            Location
                            <input
                                type="text"
                                onChange={e => this.change_Handler("location", e)}
                                value={this.state.location}
                            />
                        </label>
                        <label className="Employment Status">
                            Employment Status
                            <input
                                type="text"
                                onChange={e => this.change_Handler("employment_status", e)}
                                value={this.state.employment_status}
                            />
                        </label>
                        <label className="Skills">
                            Skills
                            <input
                                type="text"
                                onChange={e => this.change_Handler("skills", e)}
                                value={this.state.skills}
                            />
                        </label>
                        <br/>
                        <br/>
                        <input type="submit" id="login_button" value="Save Changes" className="button-primary"/>
                    </form>
                </div>
            </div>
        );
    }
}
