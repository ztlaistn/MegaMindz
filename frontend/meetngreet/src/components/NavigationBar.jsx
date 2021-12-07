import React from 'react';
import './styles/NavigationBar.css'
import logo from "../assets/logo.png";
import {Link} from 'react-router-dom';
import {BrowserView, MobileView} from 'react-device-detect';
import ModalMenu from './ModalMenu.jsx';

import MicOnButton from "./elements/MicOn";
import MicOffButton from "./elements/MicOff";

class NavigationBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuToggled: false,
            muted: false
        };
    };

    state = {
        show: false,
        menu: false
      };
      showModal = e => {
        this.setState({
          show: !this.state.show
        });
        this.setState({
            menu: true
          });
      };
      showHelpModal = e => {
        this.setState({
          show: !this.state.show
        });
        this.setState({
            menu: false
          });
      };
      onClose = e => {
        this.props.onClose && this.props.onClose(e);
      };



    toLogin = () => {
        window.location.href = "login";
    };

    toRegistration = () => {
        window.location.href = "/registration";
    };

    toHome = () => {
        window.location.href = "/";
        sessionStorage.removeItem("roomId");
    };

    toChatroom = () => {
        window.location.href = "/chatroom";
    };

    logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("roomId");
        window.location.href = "login";
    }

    toggleMute = () => {
        // toggle
        document.getElementById("our-media-device").srcObject.getAudioTracks()[0].enabled = !document.getElementById("our-media-device").srcObject.getAudioTracks()[0].enabled;
        // change text of mute button
        //const buttonText = this.state.muteText == "Mute" ? "Unmute" : "Mute";
        this.setState({
            muted: !this.state.muted
        });
    };

    userSettings = () => {
        window.location.href = "/user-account";
    };

    callMeeting = () => {
        //TODO: placeholder
        window.alert("Not currently supported.");
    };

    chatroomUsers = () => {
        window.location.href = "/chatroom-users";
    };

    openRoomMenu = () => {
        //TODO: placeholder
        window.alert("Not currently supported.");
    };

    leaveRoom = () => {
        window.location.href = "/";
    };

    listUsersInRoom = () => {
        const data = { roomId: sessionStorage.getItem("roomId")};
        fetch('/room/listRoom', {
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
                        window.alert("Error: Something went wrong " + response.status);
                      });
                    return;
                  }
                  // Examine the text in the response
                  response.json().then(function(data) {
                    window.alert(data.user_list);
                    //document.getElementById("testy").onclick = window.alert("test");
                    //document.getElementById("testy").onclick = function() {
                    //    {this.callMeeting}
                    //}

                  });
                }
              )
              .catch(function(err) {
                console.log('Fetch Error :-S', err);
              });
        
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
        }else if(window.location.pathname === "/user-agreement"){
            return(
                <div className="login-bar">
                    <li>
                        <input type="button" value="Home" className="button-primary" onClick={this.toHome}/>
                    </li>
                </div>
            );
        }else if(window.location.pathname === "/chatroom"){
            return(
                <div className="chatroom-bar">
                    <li>
                        <input type="button" value={"Room Code: " + sessionStorage.getItem("roomId")} className="button-primary"/>
                    </li>
                    <li>
                        {this.state.muted ? <MicOffButton onClick={this.toggleMute} /> : <MicOnButton onClick={this.toggleMute} />}
                    </li>
                    <li>
                        <input type="button" value="Menu" class="button-chatroom-dropdown"/>
                        <div class="dropdown-content">
                            <div class="dropdown-option" onClick={this.userSettings}>User Settings</div>
                            <div class="dropdown-option" onClick={this.callMeeting}>Call a Meeting</div>
                            <div class="dropdown-option" onClick={this.toggleMute}>Toggle Audio</div>
                            <div class="dropdown-option" onClick={this.listUsersInRoom}>Users in Room</div>
                            <div class="dropdown-option" onClick={e => {this.showModal();}}>Admin Options</div>
                            <div class="dropdown-option" onClick={e => {this.showHelpModal();}}>Help</div>
                        </div>
                    </li>
                    <li>
                        <input type="button" value="Leave Room" className="button-chatroom-leave" onClick={this.leaveRoom}/>
                    </li>
                </div>
            );
        }else if(window.location.pathname === "/chatroom-users"){
            return(
                <div className="chatroom-bar">
                    <li>
                        <input type="button" value={"Room Code: " + sessionStorage.getItem("roomId")} className="button-primary"/>
                    </li>
                    <li>
                        <input type="button" value="Return to Room" className="button-chatroom" onClick={this.toChatroom}/>
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
            } else if(window.location.pathname === "/user-agreement"){
                return(
                    <div className="mobile-menu">
                        <input type="button" value="=" className="button-hamburger" onClick={this.toggleMenu}/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <input type="button" value="Home" className="hamburger-item" onClick={this.toHome}/>
                    </div>
                );
            } else if(window.location.pathname === "/user-account"){
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
            } else if(window.location.pathname === "/chatroom"){
                return(
                    <div className="mobile-menu">
                        <input type="button" value="=" className="button-hamburger" onClick={this.toggleMenu}/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <input type="button" value={"Room Code: " + sessionStorage.getItem("roomId")} className="hamburger-item"/>
                        <br/>
                        <br/>
                        <input type="button" value="User Settings" className="hamburger-item" onClick={this.userSettings}/>
                        <br/>
                        <br/>
                        <input type="button" value="Call a Meeting" className="hamburger-item" onClick={this.callMeeting}/>
                        <br/>
                        <br/>
                        <input type="button" value="Toggle Mute" className="hamburger-item" onClick={this.toggleMute}/>
                        <br/>
                        <br/>
                        <input type="button" value="Users in Room" className="hamburger-item" onClick={this.listUsersInRoom}/>
                        <br/>
                        <br/>
                        <input type="button" value="Leave Room" className="hamburger-item" onClick={this.toHome}/>
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
        if (window.self !== window.top) {
            return null;
        }
        if (window.location.pathname === "/chatroom") {
        return (
            <>
                <BrowserView>
                    <div className="modal-wrapper">
                        <ModalMenu onClose={this.showModal} show={this.state.show} menu={this.state.menu}/>
                    </div>
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
        else {
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
}
export default NavigationBar;
