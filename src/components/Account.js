import React, { Component } from 'react'
import API from 'services/api'

import { NotificationManager } from 'react-notifications'

import { Link } from 'react-router-dom'

const delay = (ms = 1000) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms)
    })
}

const setLoader = (context, name, state) => {
    context.setState({
        loaders: Object.assign(context.state.loaders, {
            [name]: state
        })
    })
}

class Account extends Component {
    constructor (props) {
        super(props)

        this.state = {
            address: API.util.getAddressByPrivateKey(props.privateKey),
            balance: 0,
            loaders: {},
        }
    }

    refresh (ms = 0) {
        delay(ms).then(async () => {
            setLoader(this, 'refresh', true)

            if (this.state.game) {
                let state = await API.main.gameStatus(this.state.game)

                console.log(state)

                this.setState({
                    gameState: state
                })
            }
            
            setLoader(this, 'refresh', false)
        })
    }

    async startGame () {
        setLoader(this, 'start', true)

        let data = await API.main.startGame(this.props.privateKey, this.state.opponent)

        if (data) {
            this.refresh()

            this.setState({
                tx: data
            })
        } else {
            NotificationManager.error('Error creating transaction', 'Error!')
        }

        setLoader(this, 'start', false)
    }

    async loadGame () {
        setLoader(this, 'load', true)

        let state = await API.main.gameStatus(this.state.gameId)

        if (state) {
            this.setState({
                gameState: state,
                game: this.state.gameId
            })

            this.refresh()
        }
    }

    async playMove () {
        setLoader(this, 'start', true)

        let data = await API.main.playMove(this.props.privateKey, this.state.game, this.state.field)

        if (data) {
            this.refresh()

            this.setState({
                tx: data
            })
        } else {
            NotificationManager.error('Error creating transaction', 'Error!')
        }

        setLoader(this, 'start', false)
    }

    relayTx () {
        setLoader(this, 'relay', true)

        this.setState({
            relayMsgShow: false
        })

        API.util.signTransaction(this.props.privateKey, this.state.tx, true).then(data => {
            console.log(data)
            if (!data.check_tx.code && !data.deliver_tx.code) {
                this.refresh()

                NotificationManager.success('Transaction broadcasted successfully.', 'Transaction')

                this.setState({
                    tx: null
                })
            } else {
                NotificationManager.error((data.deliver_tx.log && data.deliver_tx.log.replace(/error(:|)\s+/ig, '')) || data.check_tx.log.replace(/error(:|)\s+/ig, ''), 'Error!')
            }

            setLoader(this, 'relay', false)
        }).catch(e => {
            NotificationManager.error(e.message, 'Error!')

            setLoader(this, 'relay', false)
        })
    }

    onCheck (event) {
        this.setState({
            [event.target.id]: event.target.checked
        })
    }

    onChange (event) {
        this.setState({
            [event.target.id]: event.target.value
        })
    }

    componentDidMount () {
        this.refresh()

        API.events.onTx(data => {
            let tx = API.util.decodeTx(data.TxResult.tx)

            const address = this.state.address

            // TODO: Add transactions            
        })
    }

    render() {
        return (
            <React.Fragment>
                <div id="account">
                    <h2>
                        Address information
                    </h2>
            
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    Address
                                </td>
                                <td className="address">{this.state.address}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="actions" style={{ marginBottom: '20px' }}>
                        <div className="refresh-form" style={{ display: 'inline' }}>
                            <button className="btn btn-info refresh" onClick={() => this.refresh()}>Refresh {this.state.loaders.refresh ? (<span className="loading"></span>) : ('')}</button>
                        </div>
                    </div>

                    { this.state.game ? 
                    (<React.Fragment>
                        <h2>Game</h2>
                        
                        <table>
                            {[1,2,3].map(i => <tr>{[1,2,3].map(j => <td style={{width: "50px"}} onClick={() => this.setField(i)}></td>)}</tr>)}
                        </table>
                    </React.Fragment>) :
                    (<React.Fragment>
                    <fieldset className="form-group">
                        <label htmlFor="opponent" style={{width: "200px"}}>Opponent address:</label>
                        <input
                            id="opponent"
                            onChange={ (e) => this.onChange(e) }
                            type="text"
                            placeholder="Address"
                            value={this.state.opponent}
                            name="opponent"
                            className="form-control"
                        />
                        <span className="btn btn-primary generate" onClick={() => this.startGame()}>Start new game</span>
                    </fieldset>
                    OR
                    <fieldset className="form-group">
                        <label htmlFor="opponent" style={{width: "200px"}}>Game ID:</label>
                        <input
                            id="gameId"
                            onChange={ (e) => this.onChange(e) }
                            type="text"
                            placeholder="Game ID"
                            value={this.state.gameId}
                            name="gameId"
                            className="form-control"
                        />
                        <span className="btn btn-primary generate" onClick={() => this.startGame()}>Load existing game</span>
                    </fieldset>
                    </React.Fragment>)}
                    

                    { this.state.tx ? 
                    (<React.Fragment>
                        <h2>Transaction</h2>
                
                        <div className="grid">
                            <div className="cell -12of12">
                                <textarea style={{ width: '100%' }} rows="18" id="signed-tx" disabled={ true } value={JSON.stringify(this.state.tx, null, 4)}></textarea>
                            </div>
                        </div>
                
                        <br />
                
                        <div className="grid">
                            <div className="cell -12of12">
                                <button className="btn btn-success btn-block relay" disabled={ !this.state.tx } onClick={() => this.relayTx()}>Sign and broadcast transaction {this.state.loaders.relay ? (<span className="loading"></span>) : ('')}</button>
                            </div>
                        </div>
                    </React.Fragment>) :
                    null}
                </div>
            </React.Fragment>
        )
    }
}

export default Account
