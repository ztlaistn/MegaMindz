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

    process_login = () => {
        //implement login handler here
        console.log("Initiated login");
        if(((document.getElementById("email").validity.valid) && (document.getElementById("password").value.length !== 0)) && ((document.getElementById("email").value.includes("@")) && (document.getElementById("email").value.includes(".")))){
            //check database and redirect to home page
            const data = { email: document.getElementById("email").value, password: document.getElementById("password").value };
            fetch('/auth/login', {
            method: 'POST', // or 'PUT'
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            }).then(
                function(response) {
                  if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                      response.status);
                      response.json().then(function(data) {
                        console.log(data);
                        window.alert("Error: Invalid login. Code " + response.status);
                      });
                    return;
                  }
                  // Examine the text in the response
                  response.json().then(function(data) {
                    console.log(data.token);
                    sessionStorage.setItem("token", data.token);
                    sessionStorage.setItem("username", data.username);
                    window.location.href = "/";
                  });
                }
              )
              .catch(function(err) {
                console.log('Fetch Error :-S', err);
              });
        } else {
            window.alert("Error: Missing one or more required fields.")
        }
    }

    toRegistration = () => {
        window.location.href = "registration";
    };

    render() {
        return (
            <div id="login-form">
                <img src={login_icon} className="login-icon" alt=""/>
                <div className="login-credentials">
                    <form>
                        <label for="email" className="text-input-label">Email Address</label>
                        <input type="email" required id="email" name="email" placeholder="Email" onChange={this.check_credentials}/>
                        <label for="password" className="text-input-label">Password</label>
                        <input type="password" required id="password" name="password" placeholder="Password" onChange={this.check_credentials}/>
                        <input type="button" id="login_button" value="Log In" className="button-primary" onClick={this.process_login}/>
                    </form>
                    <br/>
                    <br/>
                    <header className="register-prompt">Don't have an account?</header>
                    <input type="button" value="Register" className="button-secondary" onClick={this.toRegistration}/>
                </div>
            </div>
        );
    }
}