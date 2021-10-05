import logo from './logo.svg';
import './App.css';
import CardTemplate from "./components/CardTemplate.jsx";
import LoginForm from "./components/Login.jsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">
       <CardTemplate page_title={"User Login"}>
       <LoginForm/>
       </CardTemplate>
      </header>
    </div>
  );
}

export default App;
