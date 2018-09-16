import React, { Component } from 'react'
import openpgp from 'openpgp'

import { Button, Panel } from 'react-bootstrap'

export default class PGP extends Component {
  constructor(props) {
    super(props)
    this.state = {
      privateKey: null,
      publicKey: null,
      revocationSignature: null
    }
  }

  createKeys() {
    var options = {
      userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }], // multiple user IDs
      curve: "ed25519",                                         // ECC curve name
      passphrase: 'super long and hard to guess secret'         // protects the private key
    };
    openpgp.generateKey(options).then((key) => {
      this.setState({
        privateKey: key.privateKeyArmored,
        publicKey: key.publicKeyArmored,
        revocationSignature: key.revocationSignature
      })
    });
  }

  render() {
    const { privateKey, publicKey } = this.state
    return (
      <div>
        <div>
          <h4>
            Create Keys <label><Button
              bsStyle="primary"
              bsSize="small"
              onClick={this.createKeys.bind(this)}
            >Create</Button></label>
          </h4>
          <Panel>
            <Panel.Heading>Public Key</Panel.Heading>
            <Panel.Body>{publicKey}</Panel.Body>
          </Panel>
          <Panel>
            <Panel.Heading>Private Key</Panel.Heading>
            <Panel.Body>{privateKey}</Panel.Body>
          </Panel>
        </div>
        <h1>Encrypt Message</h1>
        <h1>Decrypt Message</h1>
      </div>
    )
  }
}
