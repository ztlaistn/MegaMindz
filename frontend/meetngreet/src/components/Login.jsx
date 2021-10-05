import React from "react";
import "./styles/Login.css";
import "./styles/Input.css";
import login_icon from "../assets/login_icon.png";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            empty_email: false,
            empty_password: false
        };
    }

    check_credentials = () => {
        if(((document.getElementById("email").validity.valid) && (document.getElementById("password").value.length != 0)) && ((document.getElementById("email").value.includes("@")) && (document.getElementById("email").value.includes(".")))){
            document.getElementById("login_button").disabled = false;
        } else {
            document.getElementById("login_button").disabled = true;
        }
    }

    render() {
        return (
            <div id="loginform">
                <img src={login_icon} className="login-icon" alt=""/>
                <div className="logincredentials">
                    <form>
                        <label for="email">Email Address</label>
                        <input type="email" required id="email" name="email" placeholder="Email" onChange={this.check_credentials}/>
                        <label for="password">Password</label>
                        <input type="password" required id="password" name="password" placeholder="Password" onChange={this.check_credentials}/>
                        <input type="submit" id="login_button" value="Log In" disabled className="button-primary"/>
                    </form>
                    <br/>
                    <br/>
                    <header className="register-prompt">Don't have an account?</header>
                    <input type="submit" value="Register" className="button-secondary"/>
                </div>
            </div>
        );
    }
}