import React from "react";
import "./styles/Login.css";
import "./styles/Input.css";
import "./styles/Text.css";
import login_icon from "../assets/login_icon.png";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: "",
        };
    }

    process_login = () => {
        // reference to this class 
        const loginClass = this;
        //implement login handler here
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
                (response) => {
                  if (response.status !== 200) {
                      response.json().then(function(data) {
                        loginClass.setState({
                          errorMsg: data.message
                        });
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
            loginClass.setState({
              errorMsg: "Error: Missing one or more required fields."
            });
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
                        <input type="email" required id="email" name="email" placeholder="Email" onChange={this.check_credentials} onKeyDown={(event)=> {
                        if(event.key === "Enter") {
                          this.process_login();
                        };
                        }}/>
                        <label for="password" className="text-input-label">Password</label>
                        <input type="password" required id="password" name="password" placeholder="Password" onChange={this.check_credentials} onKeyDown={(event)=> {
                        if(event.key === "Enter") {
                          this.process_login();
                        };
                        }}/>
                        <aside class="error-text">{this.state.errorMsg}</aside>
                        <input type="button" id="login_button" value="Log In" className="button-primary" onClick={this.process_login}/>
                    </form>
                    <br/>
                    <header className="register-prompt">Don't have an account?</header>
                    <input type="button" value="Register" className="button-secondary" onClick={this.toRegistration}/>
                </div>
            </div>
        );
    }
}