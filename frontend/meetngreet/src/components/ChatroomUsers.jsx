import React from "react";
import "./styles/Text.css";
import "./styles/Input.css";
import "./styles/ChatroomUsers.css";


export default class ChatroomUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          username: "",
          roomId: null,
          noRoomError: false,
          users: [],
          usersLoaded: false,
        };
    }

    componentDidMount() {
        // if no token, redirect to login page
        let temp = this
        if(sessionStorage.getItem("token") == null){
            window.location.href = "login";
        } else {
            temp.setState({
                  username: sessionStorage.getItem("username")

            });
        }

        const oldThis = this;
        // get roomId
        const roomId = sessionStorage.getItem("roomId");

        // if no roomId, show error message to user
        if (!roomId || !(+roomId)) {
            oldThis.setState({noRoomError: true});
        } else {
            oldThis.setState({roomId: roomId});
            fetch('/room/listRoomAdmin', {
                method: 'POST', // or 'PUT'
                headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                },
                body: JSON.stringify({ roomId: sessionStorage.getItem("roomId")}),
            }).then(function(response){
                if(response.status !== 200){
                    response.json().then(function(data) {
                        console.log(data);
                        window.alert("Error: Failed to Enter Admin Options Page : " + data.message);
                        window.location.href = "/chatroom";
                    });
                }else{
                    response.json().then(function(data){
                        console.log(data)
                        oldThis.setState({
                            users: data,
                            usersLoaded: true
                        });
                    });
                }
            }).catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
        }

    }

    toHome = () => {
        window.location.href = "/home";
    };

    testAlert(username, userId ,roleNumber) {
        window.alert("Hi "+username+" your role number is "+roleNumber+ " and ur user id is "+userId)
    }

    demoteUser(user_Id) {
        fetch('/users/demoteUser', {
            method: 'POST', // or 'PUT'
            headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem("token")
            },
            body: JSON.stringify({ roomId: sessionStorage.getItem("roomId"), user_Id: user_Id, auth: sessionStorage.getItem("token")}),
        }).then(function(response){
            if(response.status !== 200){
                response.json().then(function(data) {
                    console.log(data);
                    window.alert("Error: Failed to Demote User : " + data.message);
                    window.location.href = "/chatroom";
                });
            }else{
                response.json().then(function(data){
                    console.log(data);
                    window.alert("" + data.message);
                });
            }
        }).catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
    }

    makeUserVIP(user_Id) {
        fetch('/users/makeUserVIP', {
            method: 'POST', // or 'PUT'
            headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem("token")
            },
            body: JSON.stringify({ roomId: sessionStorage.getItem("roomId"), user_Id: user_Id, auth: sessionStorage.getItem("token")}),
        }).then(function(response){
            if(response.status !== 200){
                response.json().then(function(data) {
                    console.log(data);
                    window.alert("Error: Failed to Make User VIP : " + data.message);
                    window.location.href = "/chatroom";
                });
            }else{
                response.json().then(function(data){
                    console.log(data);
                    window.alert("" + data.message);
                });
            }
        }).catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
    }

    makeUserModerator(user_Id) {
        fetch('/users/makeUserModerator', {
            method: 'POST', // or 'PUT'
            headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem("token")
            },
            body: JSON.stringify({ roomId: sessionStorage.getItem("roomId"), user_Id: user_Id, auth: sessionStorage.getItem("token")}),
        }).then(function(response){
            if(response.status !== 200){
                response.json().then(function(data) {
                    console.log(data);
                    window.alert("Error: Failed to Make User Moderator : " + data.message);
                    window.location.href = "/chatroom";
                });
            }else{
                response.json().then(function(data){
                    console.log(data);
                    window.alert("" + data.message);
                });
            }
        }).catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
    }

    removeUserFromRoom(userId2) {
        

    }
    
    render() {
        const {usersLoaded, users} = this.state;
        console.log(this.state.noRoomError);
        if (this.state.noRoomError) {
            return (
                <div class="chatroom-container">
                    <h1 class="title-font">Error: You have not joined a valid room</h1>
                    <input type="button" value="Return to Home" className="button-primary" onClick={this.toHome}/>
                </div>
            )
        }
        if (!usersLoaded) {
            return (
                
                <div class="chatroom-container">
                    <div class="chatroom">
                        Please wait...
                    </div>
                </div>
            );
        }
        else {
            return (
                <div class="chatroom-container">
                    <div class="chatroom">
                    Demote User
                    {users.user_list.map((user) => ( 
                    <input type="button" value={user[1]} className="button-primary" onClick={() => this.demoteUser(user[0])}/>
                    ))}
                    </div>
                    <div class="chatroom">
                    Make User VIP
                    {users.user_list.map((user) => ( 
                    <input type="button" value={user[1]} className="button-primary" onClick={() => this.makeUserVIP(user[0])}/>
                    ))}
                    </div>
                    <div class="chatroom">
                    Make User Moderator
                    {users.user_list.map((user) => ( 
                    <input type="button" value={user[1]} className="button-primary" onClick={() => this.makeUserModerator(user[0])}/>
                    ))}
                    </div>
                    <div class="chatroom">
                    Remove User From Room
                    {users.user_list.map((user) => ( 
                    <input type="button" value={user[1]} className="button-primary" onClick={() => this.testAlert(user[1],user[0],user[2])}/>
                    ))}
                    </div>
                </div>
            );
        }
    }
}
