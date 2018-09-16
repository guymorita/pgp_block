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
import { Grid, Row, Col } from 'react-bootstrap'

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
      <Grid>
        <Row className="show-grid">
          <Col xs={6} xsOffset={3}>
            {!isUserSignedIn() ?
              <Signin handleSignIn={this.handleSignIn} />
              : <div>
                <Profile handleSignOut={this.handleSignOut} />
                <PGP />
              </div>
            }
          </Col>
        </Row>
      </Grid>
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
