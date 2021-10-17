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
            empty_email: false,
            empty_password: false
        };
    }

    render() {
        return (
            <div id="user-account">
                <img src={sample_profile} className="profile-picture" alt=""/>
                <div className="account-credentials">
                    <form>
                        <label for="name">Name</label>
                        <input type="text" placeholder="Name"/>
                        <label htmlFor="age">Date of Birth</label>
                        <input type="text" placeholder="Date of Birth"/>
                        <label htmlFor="location">Location</label>
                        <input type="text" placeholder="Location"/>
                        <label htmlFor="employment">Employment Status</label>
                        <input type="text" placeholder="Employment Status"/>
                        <label htmlFor="skills">Skills</label>
                        <input type="text" placeholder="Skills"/>
                    </form>
                    <br/>
                    <input type="submit" id="login_button" value="Save Changes" className="button-primary"/>
                </div>
            </div>
        );
    }
}
