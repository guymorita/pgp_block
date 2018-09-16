import React, { Component } from 'react'
import {
  isSignInPending,
  loadUserData,
  Person,
} from 'blockstack'
import { Nav, NavItem } from 'react-bootstrap'

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      person: {
        name() {
          return 'Anonymous';
        },
        avatarUrl() {
          return avatarFallbackImage;
        },
      },
    };
  }

  render() {
    const { handleSignOut } = this.props;
    const { person } = this.state;
    return (
      !isSignInPending() ?
        <Nav pullRight>
          <NavItem href="#" onClick={handleSignOut.bind(this)}>
            Logout
          </NavItem>
        </Nav>
      : null
    );
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
    });
  }
}

