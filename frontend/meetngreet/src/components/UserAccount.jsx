import React from "react";
import "./styles/Login.css";
import "./styles/Input.css";
import "./styles/UserAccount.css";

import sample_profile from "../assets/sample-profile.png";
import login_icon from "../assets/login_icon.png";

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
            url : process.env.SITE_URL
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
                    skills: this.state.skills
                }
            })
        }).then(
            function(response){
                if(response.status !== 200){
                    response.json().then(function(data) {
                        console.log(data);
                        window.alert("Error: Failed User Account Set " + response.status);
                    });
                }else{
                    response.json().then(function(data) {
                        console.log(data);
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
                            window.alert("Error: Failed User Account Fetch Code " + response.status);
                        });
                    }else{
                        //console.log("This is us4: ", this);
                        response.json().then(function(data) {
                            console.log(data);
                            temp_this.setState({
                                full_name: data.full_name,
                                dob: data.dob,
                                location: data.location,
                                status: data.status,
                                skills: data.skills
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


    render() {
        return (
            <div id="user-account">
                <img src={sample_profile} className="profile-picture" alt=""/>
                <div className="account-credentials">
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
