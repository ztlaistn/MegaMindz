import React from "react";
import "./styles/CardTemplate.css";
import LoginForm from "./Login.jsx";
import {
   Link
} from 'react-router-dom';
import gray_logo from "../assets/logo_gray.png";

export default class CardTemplate extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="card-template" className="card-template">
                <div className="card-frame">
                    <img src={gray_logo} className="alt-logo" alt=""/>
                    <br/>
                    <header className="card-title">{this.props.page_title}</header>
                    <br/>
                    <LoginForm/>
                </div>
            </div>
        );
    }
}