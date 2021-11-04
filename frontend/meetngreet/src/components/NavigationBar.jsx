import React from 'react';
import './styles/NavigationBar.css'
import logo from "../assets/logo.png";
import {Link} from 'react-router-dom';

class NavigationBar extends React.Component {
    constructor(props) {
        super(props);
    }

    toLogin = () => {
        window.location.href = "login";
    };

    toHome = () => {
        window.location.href = "/";
    };

    logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("roomCode");
        window.location.href = "login";
    }

    toggleMute = () => {
        window.location.href = "/";
    };

    openRoomMenu = () => {
        window.location.href = "/";
    };

    leaveRoom = () => {
        window.location.href = "/";
    };

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
        }else if(window.location.pathname === "/chatroom2"){
            return(
                <div className="chatroom-bar">
                    <li>
                        <input type="button" value="Room Code: ABC123" className="button-primary"/>
                    </li>
                    <li>
                        <input type="button" value="Toggle Mute" className="button-chatroom" onClick={this.toggleMute}/>
                    </li>
                    <li>
                        <input type="button" value="Menu" className="button-chatroom" onClick={this.openRoomMenu}/>
                    </li>
                    <li>
                        <input type="button" value="Leave Room" className="button-chatroom-leave" onClick={this.leaveRoom}/>
                    </li>
                </div>
            );
        }else if(window.location.pathname === "/"){
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
        if(window.location.pathname === "/chatroom2"){
            return (
                <div className="navigation-bar">
                    {this.showLogin()}
                </div>
            );
        }
        else {
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
}
export default NavigationBar;
