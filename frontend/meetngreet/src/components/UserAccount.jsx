import React from "react";
import "./styles/Login.css";
import "./styles/Input.css";
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
            <div id="loginform">
                <img src={sample_profile} className="login-icon" alt=""/>
                <div className="useraccount">
                    <form>
                        <label for="name">Name</label>
                        <input type="text"/>
                        <label htmlFor="age">Age</label>
                        <input type="text" />
                        <label htmlFor="location">Location</label>
                        <input type="text" />
                        <label htmlFor="employment">Employment Status</label>
                        <input type="text" />
                        <label htmlFor="skills">Skills</label>
                        <input type="text" />

                    </form>
                    <br/>

                    <input type="submit" id="login_button" value="Save Changes" disabled className="button-primary"/>

                </div>
            </div>
        );
    }
}
