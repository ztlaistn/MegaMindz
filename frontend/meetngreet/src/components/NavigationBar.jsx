import React from 'react';
import './styles/NavigationBar.css'
import logo from "../assets/logo.png";
import {Link} from 'react-router-dom';

class NavigationBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logged_in: false
        };
    }

    toLogin = () => {
        window.location.href = "login";
    };

    toHome = () => {
        window.location.href = "home";
    };

    logout = () => {
        sessionStorage.removeItem("token", null);
        this.state = {
            logged_in: false
        };
        window.location.href = "login";
    }

    showLogin = () => {
        if(window.location.pathname === "/registration"){
            return(
                <div className="login-bar">
                    <li>
                        <label>Already have an account?</label>
                    </li>
                    <li>
                        <input type="button" value="Log In" className="button-primary" onClick={this.toLogin}/>
                    </li>
                </div>
            );
        }else if(window.location.pathname === "/home"){
            return(
                <div className="login-bar">
                    <li>
                        <input type="button" value="Log Out" className="button-primary" onClick={this.logout}/>
                    </li>
                </div>
            );
        }
        else if(sessionStorage.getItem("token") != null){
            return(
                <div className="login-bar">
                    <li>
                        <input type="button" value="Home" className="button-primary" onClick={this.toHome}/>
                    </li>
                    <li>
                        <input type="button" value="Log Out" className="button-primary" onClick={this.logout}/>
                    </li>
                </div>
            );
        }
    }

    render() {
        return (
            <div className="navigation-bar">
                <div className="logo-bar">
                    <li>
                        <Link to="/" >
                            <img src={logo} title="Home" className="logo"/>
                        </Link>
                    </li>
                </div>
                {this.showLogin()}
            </div>
        );
    }
}
export default NavigationBar;