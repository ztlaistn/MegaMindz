import React from "react";
import "./styles/Registration.css";
import "./styles/Input.css";
import { Link } from "react-router-dom";
import registration_icon from "../assets/registration_icon.png";

export default class Registration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            empty_email: false,
            empty_password: false
        };
    }

    process_registration() {
        //implement registration handler here
        if(((document.getElementById("email").validity.valid) && (document.getElementById("username").value.length !== 0) && (document.getElementById("password").value === document.getElementById("password-confirmation").value) && (document.getElementById("password").value.length > 7)) && ((document.getElementById("email").value.includes("@")) && (document.getElementById("email").value.includes(".")))){
            const data = { email: document.getElementById("email").value, password1: document.getElementById("password").value, password2: document.getElementById("password-confirmation").value, username: document.getElementById("username").value };
            fetch('/auth/register', {
            method: 'POST', // or 'PUT'
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
              console.log('Success:', data);
            })
            .catch((error) => {
              console.error('Error:', error);
            });
        } else {
            window.alert("Error: Missing one or more required fields.")
        }
    }

    render() {
        return (
            <div id="registration-form">
                <img src={registration_icon} className="registration-icon" alt=""/>
                <div className="registration-credentials">
                    <form>
                        <label for="email">Email Address</label>
                        <input type="email" required id="email" name="email" placeholder="Email" onChange={this.check_credentials}/>
                        <label for="username">Username</label>
                        <input type="text" required id="username" name="username" placeholder="Username" onChange={this.check_credentials}/>
                        <label for="password">Password (Must be at least 8 characters)</label>
                        <input type="password" required id="password" name="password" placeholder="Password" onChange={this.check_credentials}/>
                        <label for="password-confirmation">Confirm Password</label>
                        <input type="password" required id="password-confirmation" name="password-confirmation" placeholder="Password" onChange={this.check_credentials}/>
                        <br/>
                        <br/>
                        <input type="button" value="Register" className="button-primary" onClick={this.process_registration}/>
                    </form>
                </div>
            </div>
        );
    }
}
