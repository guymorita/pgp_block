import React, { Component } from 'react'

import { Grid, Row, Col } from 'react-bootstrap'

export default class PGP extends Component {
  render() {
    return (
      <Grid>
        <Row className="show-grid">
          <Col xs={12} md={8}>
            <code>{'<Col xs={12} md={8} />'};</code>
          </Col>
          <Col xs={6} md={4}>
            <code>{'<Col xs={6} md={4} />'}</code>
          </Col>
        </Row>
      </Grid>
    )
  }
}
