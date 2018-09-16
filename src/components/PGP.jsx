import React, { Component } from 'react'

export default class PGP extends Component {
  constructor(props) {
    super(props)
    this.state = {
      privateKey: null,
      publicKey: null
    }
  }

  createKeys() {

  }

  render() {
    return (
      <div>
        <h1>Create Key</h1>
        <h1>Encrypt Message</h1>
        <h1>Decrypt Message</h1>
      </div>
    )
  }
}
