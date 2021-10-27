import './App.css';
import CardTemplate from "./components/CardTemplate.jsx";
import LoginForm from "./components/Login.jsx";
import RegistrationForm from "./components/Registration.jsx";
import UserAccount from "./components/UserAccount.jsx";
import Chatroom from "./components/Chatroom.jsx";
import React from "react";
import NavigationBar from './components/NavigationBar.jsx';
import Home from './components/Home.jsx';
import {
  BrowserRouter as Router, Route, Switch
} from 'react-router-dom';

class App extends React.Component {
    render() {
        return (
            <Router basename={process.env.PUBLIC_URL}>
                <div className="App">
                    <NavigationBar/>
                    <br/>
                    <header className="App-header">
                        <Switch>
                            <Route path="/registration">
                                <CardTemplate page_title={"User Registration"}>
                                    <RegistrationForm/>
                                </CardTemplate>
                            </Route>
                            <Route path="/user-account">
                                <CardTemplate page_title={"User Account"}>
                                    <UserAccount/>
                                </CardTemplate>
                            </Route>
                            <Route path="/login">
                                <CardTemplate page_title={"User Login"}>
                                    <LoginForm/>
                                </CardTemplate>
                            </Route>
                            <Route path="/chatroom2">
                                <Chatroom/>
                            </Route>
                            <Route path="/">
                                <CardTemplate page_title={"Home"}>
                                    <Home/>
                                </CardTemplate>
                            </Route>
                        </Switch>
                    </header>
                </div>
            </Router>
        );
    }
}
export default App;
