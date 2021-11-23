import React from "react";
import "./styles/Login.css";
import "./styles/Input.css";
import "./styles/UserAccount.css";

import login_icon from "../assets/login_icon.png";
import zero from "../assets/sample-profile.png";
import one from "../assets/1.png";
import two from "../assets/2.png";
import three from "../assets/3.png";
import four from "../assets/4.png";

export default class UserAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //username: "",
            full_name: "",
            location: "",
            skills: "",
            status : "",
            dob : "",
            sprite : 1,
            url : process.env.SITE_URL,
            sprites_map : {1:one,2:two,3:three,4:four}
        };

        //this.change_Handler = this.change_Handler.bind(this);
        //this.handle_submit = this.handle_submit.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    change_Handler(field, e) {
        console.log("field change");
        this.setState({
            [field]: e.target.value
        });
    };

    handle_submit = event => {
        //keep the form from actually submitting
        event.preventDefault();

        //make the api call to the user controller
        fetch("/auth/setUserAccount", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+ sessionStorage.getItem("token")
            },
            body: JSON.stringify({
                "new_values": {
                    full_name: this.state.full_name,
                    dob: this.state.dob,
                    location: this.state.location,
                    status: this.state.status,
                    skills: this.state.skills,
                    sprite:this.state.sprite
                }
            })
        }).then(
            function(response){
                if(response.status !== 200){
                    response.json().then(function(data) {
                        console.log(data);
                        window.alert("Error: Failed User Account Set: " + data.message);
                    });
                }else{
                    response.json().then(function(data) {
                        console.log(data);
                        window.alert("Changes have been saved!");
                        window.location.href = "/";
                    });
                }
            }
        ).catch( function(err) {
            console.log('Set Error :-S', err);
            window.location.href = "/";
        })

    };

    componentDidMount() {
        //console.log("This is us: ", this)
        let temp_this = this;
        // first fetch the user data to allow update of username
        if(sessionStorage.getItem("token") == null){
            window.location.href = "login";
        } else {
            //console.log("This is us2: ", this)
            fetch("/auth/fetchUserAccount", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                }
            }).then(
                function(response){
                    //console.log("This is us3: ", this);
                    if(response.status !== 200){
                        response.json().then(function(data) {
                            console.log(data);
                            window.alert("Error: Failed User Account Fetch Code: " + data.message);
                        });
                    }else{
                        //console.log("This is us4: ", this);
                        response.json().then(function(data) {
                            console.log(data);
                            console.log("hii");
                            var trimmedDOB = data.dob.substring(0, 10);
                            temp_this.setState({
                                full_name: data.full_name,
                                dob: trimmedDOB,
                                location: data.location,
                                status: data.status,
                                skills: data.skills,
                                sprite: data.sprite
                            });
                        });
                    }
                }
            ).catch(function(err) {
                console.log('Fetch Error :-S', err);
                window.location.href = "/";
            });
        }
    }

    // handleClick = (props) => {
    //     this.setState({
    //         hasBeenClicked: true
    //     })
    // }

    handleClick1= () =>  {
        console.log("sprite num");
        this.setState({
            sprite:1
        });


    };
    handleClick2= () => {
        console.log("sprite num");
        this.setState({
            sprite:2

        });


    };
    handleClick3= () =>  {
        console.log("sprite num");
        this.setState({
            sprite:3
        });


    };
    handleClick4= () =>  {
        console.log("sprite num");
        this.setState({
            sprite:4
        });

    };
    render() {
        console.log(this.state.sprite)
        console.log("kk")
        console.log(this.state.sprites_map[this.state.sprite])
        return (
            <div id="user-account">
                    <div className="images">
                        <p>Choose your Avatar!</p>
                        <div className="image">
                    <img src={one} className="profile-picture" alt = "" onClick={this.handleClick1}/>
                        </div>
                        <div className="image">
                        <img src={two} className="profile-picture" alt=""  onClick={this.handleClick2}/>
                        </div>
                        <div className="image">
                        <img src={three} className="profile-picture" alt="" onClick={this.handleClick3}/>
                        </div>
                        <div className="image">
                        <img src={four} className="profile-picture" alt="" onClick={this.handleClick4}/>
                        </div>
                    </div>
                <div className="account-credentials">
                    <p>Your current Avatar!</p>
                    <img src={this.state.sprites_map[this.state.sprite]} className="profile-picture" alt = "Choose Profile Picture" />

                    <form onSubmit={this.handle_submit}>
                        <label className="name">
                            Name
                            <input
                                type="text"
                                onChange={e => this.change_Handler("full_name", e)}
                                value={this.state.full_name}
                            />
                        </label>
                        <label className="age">
                            Date of Birth
                            <input
                                type="text"
                                onChange={e => this.change_Handler("dob", e)}
                                value={this.state.dob}
                            />
                        </label>
                        <label className="location">
                            Location
                            <input
                                type="text"
                                onChange={e => this.change_Handler("location", e)}
                                value={this.state.location}
                            />
                        </label>
                        <label className="Employment Status">
                            Employment Status
                            <input
                                type="text"
                                onChange={e => this.change_Handler("status", e)}
                                value={this.state.status}
                            />
                        </label>
                        <label className="Skills">
                            Skills
                            <input
                                type="text"
                                onChange={e => this.change_Handler("skills", e)}
                                value={this.state.skills}
                            />
                        </label>
                        <br/>
                        <br/>
                        <input type="submit" id="login_button" value="Save Changes" className="button-primary"/>
                    </form>
                </div>
            </div>
        );
    }
}
