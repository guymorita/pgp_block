import React, { Component } from 'react'
import * as openpgp from 'openpgp'
import userGen from 'username-generator'
import { Button, FormControl, Panel } from 'react-bootstrap'
import {
  putFile
} from 'blockstack'

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
      passphrase: ""
    }
  }

  updatePassphrase(e) {
    this.setState({ passphrase: e.target.value })
  }

  updateMessage(e) {
    this.setState({ messageToEncrypt: e.target.value })
  }

  updatePGPEncryptedMessage(e) {
    this.setState({ pgpEncryptedMessage: e.target.value })
  }

  putBlockstack() {
    const options = { encrypt: true }
    const { privateKey, publicKey, passphrase } = this.state
    const save = { privateKey, publicKey, passphrase }
    putFile('pgp.json', JSON.stringify(save), options)
      .then(() => {
        console.log('Saved PGP data to Blockstack')
        return
      })
  }

  getBlockstack() {

  }

  createKeys() {
    const user = userGen.generateUsername()
    const options = {
      userIds: [{ name: `${user}`, email: `${user}@test.com` }],
      curve: "p521",
      passphrase: this.state.passphrase
    };
    openpgp.generateKey(options).then((key) => {
      return this.setState({
        privateKey: key.privateKeyArmored,
        publicKey: key.publicKeyArmored,
        revocationSignature: key.revocationSignature
      })
    }).then(() => {
      this.putBlockstack()
    })
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
      passphrase,
      privateKey,
      publicKey } = this.state

    const disableButtons = !passphrase

    return (
      <div>
        <div>
          <h4>
            Passphrase
          </h4>
          <Panel>
            <Panel.Heading>Enter Passphrase</Panel.Heading>
            <Panel.Body>
            <FormControl
                type="password"
                value={passphrase}
                placeholder="Enter passphrase to create / unlock private key"
                onChange={this.updatePassphrase.bind(this)}
              />
            </Panel.Body>
          </Panel>
        </div>
        <div>
          <h4>
            Create Keys <label><Button
              bsStyle="primary"
              bsSize="small"
              onClick={this.createKeys.bind(this)}
              disabled={disableButtons}
            >Create New / Save to Blockstack</Button></label> <label><Button
              bsStyle="success"
              bsSize="small"
              onClick={this.createKeys.bind(this)}
              disabled={disableButtons}
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
              disabled={disableButtons}
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
