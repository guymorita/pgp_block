import React, { Component } from 'react'
import * as openpgp from 'openpgp'
import userGen from 'username-generator'
import { Alert, Button, FormControl, Panel } from 'react-bootstrap'
import {
  putFile,
  getFile
} from 'blockstack'

const FILE = 'pgp.json'

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

  handlePassphrase(e) {
    this.setState({ passphrase: e.target.value })
  }

  handleMessage(e) {
    this.setState({ messageToEncrypt: e.target.value })
  }

  handlePGPEncryptedMessage(e) {
    this.setState({ pgpEncryptedMessage: e.target.value })
  }

  handleGetBlockstack(e) {
    const options = { decrypt: true }
    getFile(FILE, options)
      .then((file) => {
        const pgp = JSON.parse(file || '{}')
        const { publicKey, privateKey, passphrase } = pgp
        this.setState({ publicKey, privateKey, passphrase })
        console.log('Recovering PGP data from Blockstack')
      }).catch((error) => {
        console.log('Could not save PGP from Blockstack')
      })
  }

  putBlockstack() {
    const options = { encrypt: true }
    const { privateKey, publicKey, passphrase } = this.state
    const save = { privateKey, publicKey, passphrase }
    putFile(FILE, JSON.stringify(save), options)
      .then(() => {
        console.log('Saved PGP data to Blockstack')
      }).catch((error) => {
        console.log('Could not retrieve PGP from Blockstack')
      })
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
    }).catch((error) => {
      console.log('Could not generate key with openpgp')
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
      }).catch((error) => {
        console.log("Could not encrypt message on openpgp")
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
    }).catch((error) => {
      console.log("Could not decrypt message on openpgp")
    }).then((plainText) => {
      this.setState({
        decryptedMessage: plainText.data
      })
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

    const hasPassphrase = !!passphrase
    const hasKeys = privateKey && publicKey

    return (
      <div>
        <div>
          <Alert bsStyle="warning">
            Already have a PGP saved on Blockstack? <a href="#" onClick={this.handleGetBlockstack.bind(this)}>Click here to recover</a>
          </Alert>
        </div>
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
                onChange={this.handlePassphrase.bind(this)}
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
              disabled={!hasPassphrase}
            >Create New / Save to Blockstack</Button></label>
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
              disabled={!hasKeys}
            >Encrypt</Button></label>
          </h4>
          <Panel>
            <Panel.Heading>Message to Encrypt</Panel.Heading>
            <Panel.Body>
              <FormControl
                componentClass="textarea"
                value={messageToEncrypt}
                placeholder="Enter text to encrypt"
                onChange={this.handleMessage.bind(this)}
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
              disabled={!hasKeys}
            >Decrypt</Button></label>
          </h4>
          <Panel>
            <Panel.Heading>PGP-Encrypted Message</Panel.Heading>
            <Panel.Body>
              <FormControl
                componentClass="textarea"
                value={pgpEncryptedMessage}
                placeholder="Enter PGP Message"
                onChange={this.handlePGPEncryptedMessage.bind(this)}
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
