import React, { Component } from 'react'
import { Button, Col, Input, Row, Table } from 'react-materialize'
import axios from 'axios'

import constants from '../constants.json'
import lib from '../lib'

import Nav from './Nav'

const API_URL = constants[process.env.NODE_ENV].API_URL

class Partner extends Component {
    state = {
        partner: {},
        payment_changes: [],
        errors: [],
        loading: false
    }

    async componentWillMount() {
        const order_id =  this.props.match.params.order_id
        const headers = lib.getHeadersWithJWT()
        const partner = await axios.get(`${API_URL}/orders/${order_id}`, headers)
        this.setState({ partner: partner.data.data })
    }

    handlePaymentChanges = (e, payment) => {
        this.setState(prevState => ({
            payment_changes: [...prevState.payment_changes, { id: payment._id, paid: e.target.value }]
        }))
    }

    submitPaymentChanges = async (e) => {
        e.preventDefault()
        console.log('asdf', this.state.payment_changes, this.state.payment_changes)
        if (this.state.payment_changes.length > 0) {
            this.setState({ loading: !this.state.loading })
            
            const headers = lib.getHeadersWithJWT()
            for (let c of this.state.payment_changes) {
                console.log('changing ', c.id)
                const res = await axios.put(`${API_URL}/payments/${c.id}/paid`, { paid: c.paid }, headers)
                console.log(res.data)
                if (!res.data.success) {
                    this.setState(prevState => ({
                        errors: [...prevState.errors, c.id]
                    }))
                }
                
            }
            console.log('done with for loop\nerrors: ', this.state.errors)
            
            this.setState({ loading: !this.state.loading })
            window.Materialize.toast('Succesfully changed payment(s)!', 5000)
        } else {
            window.Materialize.toast('No payment changes', 5000)
            console.log('no changes')
        }
    }

    renderOrderPayments = () => {
        const { partner } = this.state 
        if (partner.payments) {
            return (
                <div>
                    <Table>
                        <thead>
                            <tr>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partner.payments.map((p) => {
                                return (
                                    <tr>
                                        <td>{lib.displayDate(p.due_date)}</td>
                                        <td>{lib.displayMoney(p.amount)}</td>
                                        <td>
                                            <Input type="select" onChange={e => this.handlePaymentChanges(e, p)}>
                                                <option value={p.paid ? true : false}>{p.paid ? 'PAID' : 'NOT PAID'}</option>
                                                <option value={!p.paid ? true : false}>{!p.paid ? 'PAID' : 'NOT PAID'}</option>
                                            </Input>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                    <br />
                    <br/>
                    <br/>
                </div>
            )
        }
    }

    render() {
        const { partner } = this.state 
        if (partner && partner.order) {
            return (
                <div>
                    <Nav history={this.props.history}/>
                    <div class="container">
                        <br/>
                        <Row>
                            <h4 s={12}>{partner.order.partner_name}</h4>
                        </Row>
                        <Row>
                            <Col s={6}>Email: {partner.order.email_address}</Col>
                            <Col s={6}>Order ID: {partner.order._id}</Col>
                        </Row>
                        <Row>
                            <Col s={6}>Mobile Number: {partner.order.mobile_number}</Col>
                            <Col s={6}>Order Status: {partner.order.status}</Col>
                        </Row>
                        <Row>
                            <Col s={12}>Account Number: {partner.order.account_number}</Col>
                        </Row>
                        <br />
                        <div>
                            <h5 id="inline-h">Payments: </h5>
                            <Button id="float-right-button" onClick={this.submitPaymentChanges}>{this.state.loading ? 'Loading...' : 'Save Payment Changes'}</Button>
                        </div>
                        {this.renderOrderPayments()}
                    </div>
                </div>
            ) 
        } else {
            return (
                <div>Loading...</div>
            )
        }
        
    }
}

export default Partner
