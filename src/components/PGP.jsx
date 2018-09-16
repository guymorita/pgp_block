import React, { Component } from 'react'
import * as openpgp from 'openpgp'

import { Button, FormControl, Panel } from 'react-bootstrap'

export default class PGP extends Component {
  constructor(props) {
    super(props)
    this.state = {
      privateKey: null,
      publicKey: null,
      revocationSignature: null,
      encryptedMessage: null,
      messageToEncrypt: "",
      pgpEncryptedMessage: "",
      decryptedMessage: "",
      passphrase: "Big things have small beginnings"
    }
  }

  createKeys() {
    const options = {
      userIds: [{ name: 'Jon Smith', email: 'jon@example.com' }], // multiple user IDs
      curve: "p256",                                         // ECC curve name
      passphrase: this.state.passphrase
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

  updatePGPEncryptedMessage(e) {
    this.setState({ pgpEncryptedMessage: e.target.value })
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

  decryptMessage() {
    const { encryptedMessage, passphrase, privateKey } = this.state

    let privKeyObj = null

    openpgp.key.readArmored(privateKey).then((p) => {
      privKeyObj = p.keys[0]
      return privKeyObj.decrypt(passphrase)
    }).then((status) => {
      console.log(privKeyObj)
      return openpgp.message.readArmored(encryptedMessage)

    }).then((parsedMessage) => {
      const options = {
        message: parsedMessage,
        privateKeys: privKeyObj
      }
      return openpgp.decrypt(options)
    }).then((plainText) => {
      this.setState({
        decryptedMessage: plainText.data
      })
      return
    })
  }

  render() {
    const {
      pgpEncryptedMessage,
      decryptedMessage,
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
            >Create New / Save to Blockstack</Button></label> <label><Button
              bsStyle="success"
              bsSize="small"
              onClick={this.createKeys.bind(this)}
            >Get Saved from Blockstack</Button></label>
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
        <div>
          <h4>
            Decrypt Message <label><Button
              bsStyle="primary"
              bsSize="small"
              onClick={this.decryptMessage.bind(this)}
            >Decrypt</Button></label>
          </h4>
          <Panel>
            <Panel.Heading>PGP-Encrypted Message</Panel.Heading>
            <Panel.Body>
              <FormControl
                componentClass="textarea"
                value={pgpEncryptedMessage}
                placeholder="Enter PGP Message"
                onChange={this.updatePGPEncryptedMessage.bind(this)}
              />
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.Heading>Decrypted Message</Panel.Heading>
            <Panel.Body>{decryptedMessage}</Panel.Body>
          </Panel>
        </div>
      </div>
    )
  }
}
