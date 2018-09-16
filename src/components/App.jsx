import React, { Component, Link } from 'react';
import Profile from './Profile.jsx';
import Signin from './Signin.jsx';
import {
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
} from 'blockstack';
import PGP from './PGP.jsx'
import { Grid, Row, Col, Nav, NavItem, Navbar } from 'react-bootstrap'

export default class App extends Component {

  constructor(props) {
    super(props);
  }

  handleSignIn(e) {
    e.preventDefault();
    const origin = window.location.origin
    redirectToSignIn(origin, origin + '/manifest.json', ['store_write', 'publish_data'])
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  render() {
    return (
      <div>
        <Navbar inverse>
          <Navbar.Header>
            <Navbar.Brand>
              PGP Block
            </Navbar.Brand>
          </Navbar.Header>
          <Nav>
            <NavItem href="#">
              OpenPGP v4.0.1
            </NavItem>
          </Nav>
          <Navbar.Collapse>
            {isUserSignedIn() ?
              <Profile handleSignOut={this.handleSignOut} /> : <div></div>
            }
          </Navbar.Collapse>
        </Navbar>
        <Grid>
          <Row className="show-grid">
            <Col xs={8} xsOffset={2}>
              {!isUserSignedIn() ?
                <Signin handleSignIn={this.handleSignIn} />
                : <PGP />
              }
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        window.location = window.location.origin;
      });
    }
  }
}
