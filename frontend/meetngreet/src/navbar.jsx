import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import './navbar.css'
import gray_logo from "./assets/logo_gray.png";

const Navigation_Registration = () => {
return (
    <>
    <Navbar>
  <Container>
    <Navbar.Brand href="/"><img src={gray_logo} width="50" height="60" className="alt-logo" alt=""/></Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
        <Nav.Link href="/about">About</Nav.Link>
        <Navbar.Text>Already have an account?</Navbar.Text>
        <Nav.Link href="/login">Log in</Nav.Link>
        
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
</>
);
}

export default Navigation_Registration;
export const Navigation_Login = () => {
  return (
      <>
      <Navbar>
    <Container>
      <Navbar.Brand href="/"><img src={gray_logo} width="50" height="60" className="alt-logo" alt=""/></Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/about">About</Nav.Link>
          <Nav.Link href="/registration">Register</Nav.Link>
          
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  </>
  );
}

export const Navigation_UserAccount = () => {
  return (
      <>
      <Navbar>
    <Container>
      <Navbar.Brand href="/"><img src={gray_logo} width="50" height="60" className="alt-logo" alt=""/></Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/about">About</Nav.Link>
          <Nav.Link href="/home">Home</Nav.Link>
          <Nav.Link href="/logout">Log Out</Nav.Link>
          
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  </>
  );
}