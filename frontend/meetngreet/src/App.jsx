import logo from './logo.svg';
import './App.css';
import CardTemplate from "./components/CardTemplate.jsx";
import LoginForm from "./components/Login.jsx";
import RegistrationForm from "./components/Registration.jsx";
import UserAccount from "./components/UserAccount.jsx";
import React from "react";
import {Link} from 'react-router-dom';
import {
  BrowserRouter as Router, Route, Switch
} from 'react-router-dom';

class App extends React.Component {
    render() {
        return (
            <Router basename={process.env.PUBLIC_URL}>
                <div className="App">
                    <header className="App-header">
                        <Switch>
                            <Route exact path="/registration">
                                <CardTemplate page_title={"User Registration"}>
                                    <RegistrationForm/>
                                </CardTemplate>
                            </Route>
                            <Route exact path="/userAccount">
                                <CardTemplate page_title={"User Account"}>
                                    <UserAccount/>
                                </CardTemplate>
                            </Route>
                            <Route exact path="/">
                                <CardTemplate page_title={"User Login"}>
                                    <LoginForm/>
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
