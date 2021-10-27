import React from 'react';
import './styles/NavigationBar.css'
import logo from "../assets/logo.png";
import {Link} from 'react-router-dom';
import {BrowserView, MobileView} from 'react-device-detect';

class NavigationBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuToggled: false
        };
    }

    toLogin = () => {
        window.location.href = "login";
    };

    toRegistration = () => {
        window.location.href = "/registration";
    };

    toHome = () => {
        window.location.href = "/";
    };

    logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
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

    toggleMenu = () => {
        if(this.state.menuToggled === false){
            this.setState({
                  menuToggled: true
            });
        } else {
            this.setState({
                  menuToggled: false
            });
        }
    }

    hamburgerMenu = () => {
        if(this.state.menuToggled === true){
            if(window.location.pathname === "/login"){
                return(
                    <div className="mobile-menu">
                        <input type="button" value="=" className="button-hamburger" onClick={this.toggleMenu}/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <input type="button" value="Registration" className="hamburger-item" onClick={this.toRegistration}/>
                    </div>
                );
            } else if(window.location.pathname === "/registration"){
                return(
                    <div className="mobile-menu">
                        <input type="button" value="=" className="button-hamburger" onClick={this.toggleMenu}/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <input type="button" value="Log In" className="hamburger-item" onClick={this.toLogin}/>
                    </div>
                );
            } else if(window.location.pathname === "/home"){
                return(
                    <div className="mobile-menu">
                        <input type="button" value="=" className="button-hamburger" onClick={this.toggleMenu}/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <input type="button" value="Log Out" className="hamburger-item" onClick={this.logout}/>
                    </div>
                );
            } else if(window.location.pathname === "/"){
                return(
                    <div className="mobile-menu">
                        <input type="button" value="=" className="button-hamburger" onClick={this.toggleMenu}/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <input type="button" value="Home" className="hamburger-item" onClick={this.toHome}/>
                        <br/>
                        <br/>
                        <input type="button" value="Log Out" className="hamburger-item" onClick={this.logout}/>
                    </div>
                );
            }
        } else {
            return(
                <input type="button" value="=" className="button-hamburger" onClick={this.toggleMenu}/>
            );
        }
    }

    render() {
        return (
            <>
                <BrowserView>
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
                </BrowserView>
                <MobileView>
                    <div className="navigation-bar">
                        <img src={logo} title="Home" className="logo-mobile"/>
                    </div>
                    {this.hamburgerMenu()}
                </MobileView>
            </>
        );
    }
}
export default NavigationBar;
