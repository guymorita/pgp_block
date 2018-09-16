import React, { Component } from 'react'
import * as openpgp from 'openpgp'

import { Button, Panel } from 'react-bootstrap'

export default class PGP extends Component {
  constructor(props) {
    super(props)
    this.state = {
      privateKey: null,
      publicKey: null,
      revocationSignature: null,
      encryptedMessage: null,
      messageToEncrypt: "",
      passphrase: "Big things have small beginnings"
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

  updateMessage(e) {
    this.setState({ messageToEncrypt: e.target.value })
  }

  encryptMessage() {
    const { messageToEncrypt, publicKey, passphrase } = this.state
    openpgp.key.readArmored(publicKey).then((keys) => {
      return keys
    }).then((keys) => {
      const options = {
        message: openpgp.message.fromText(messageToEncrypt),
        publicKeys: keys.keys
      }
      openpgp.encrypt(options).then((ciphertext) => {
        this.setState({
          encryptedMessage: ciphertext.data
        })
      })
    })
  }
  render() {
    const { privateKey, publicKey } = this.state
    const {
      messageToEncrypt,
      encryptedMessage,
      privateKey,
      publicKey } = this.state
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
        <h1>Decrypt Message</h1>
        <div>
          <h4>
            Encrypt Message <label><Button
              bsStyle="primary"
              bsSize="small"
              onClick={this.encryptMessage.bind(this)}
            >Encrypt</Button></label>
          </h4>
          <Panel>
            <Panel.Heading>Message to Encrypt</Panel.Heading>
            <Panel.Body>
              <FormControl
                componentClass="textarea"
                value={messageToEncrypt}
                placeholder="Enter text to encrypt"
                onChange={this.updateMessage.bind(this)}
              />
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.Heading>Encrypted Message</Panel.Heading>
            <Panel.Body>{encryptedMessage}</Panel.Body>
          </Panel>
        </div>
      </div>
    )
  }
}
