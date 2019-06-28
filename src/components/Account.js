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
            [name]: state,
        }),
    })
}

class Account extends Component {
    constructor(props) {
        super(props)

        this.state = {
            address: API.util.getAddressByPrivateKey(props.privateKey),
            balance: 0,
            loaders: {},
        }
    }

    refresh(ms = 0) {
        delay(ms).then(async () => {
            setLoader(this, 'refresh', true)

            if (this.state.game >= 0) {
                let state = await API.main.gameStatus(this.state.game)

                this.setState({
                    gameState: state.value,
                })
            }

            setLoader(this, 'refresh', false)
        })
    }

    async startGame() {
        setLoader(this, 'start', true)

        let data = await API.main.startGame(
            this.props.privateKey,
            this.state.opponent
        )

        if (data) {
            this.refresh()

            this.setState({
                tx: data,
            })
        } else {
            NotificationManager.error('Error creating transaction', 'Error!')
        }

        setLoader(this, 'start', false)
    }

    async loadGame() {
        setLoader(this, 'load', true)

        let state = await API.main.gameStatus(this.state.gameId)

        if (state) {
            this.setState({
                gameState: state.value,
                game: Number(this.state.gameId),
            })

            this.refresh()
        }
    }

    async playMove(index) {
        setLoader(this, 'start', true)

        let data = await API.main.playMove(
            this.props.privateKey,
            this.state.game,
            index
        )

        if (data) {
            this.refresh()

            this.setState({
                tx: data,
            })
        } else {
            NotificationManager.error('Error creating transaction', 'Error!')
        }

        setLoader(this, 'start', false)
    }

    relayTx() {
        setLoader(this, 'relay', true)

        this.setState({
            relayMsgShow: false,
        })

        API.util
            .signTransaction(this.props.privateKey, this.state.tx, true)
            .then(data => {
                if (data.logs && data.logs[0] && data.logs[0].success) {
                    this.refresh()

                    NotificationManager.success(
                        'Transaction broadcasted successfully.',
                        'Transaction'
                    )

                    if (!this.state.game && this.state.game !== 0) {
                        let gameState = JSON.parse(
                            Buffer.from(data.data, 'base64').toString('utf-8')
                        )

                        this.setState({
                            tx: null,
                            gameState: gameState,
                            game: Number(gameState.id),
                        })
                    } else {
                        this.setState({
                            tx: null,
                        })
                    }
                } else {
                    NotificationManager.error(
                        (data.deliver_tx.log &&
                            data.deliver_tx.log.replace(
                                /error(:|)\s+/gi,
                                ''
                            )) ||
                            data.check_tx.log.replace(/error(:|)\s+/gi, ''),
                        'Error!'
                    )
                }

                setLoader(this, 'relay', false)
            })
            .catch(e => {
                NotificationManager.error(e.message, 'Error!')

                setLoader(this, 'relay', false)
            })
    }

    getField(index) {
        return this.state.gameState.fields[index]
    }

    onCheck(event) {
        this.setState({
            [event.target.id]: event.target.checked,
        })
    }

    onChange(event) {
        this.setState({
            [event.target.id]: event.target.value,
        })
    }

    componentDidMount() {
        this.refresh()

        API.events.onTx(data => {
            this.refresh(1000)
        })
    }

    render() {
        return (
            <React.Fragment>
                <div id="account">
                    <h2>Address information</h2>

                    <table>
                        <tbody>
                            <tr>
                                <td>Address</td>
                                <td className="address">
                                    {this.state.address}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="actions" style={{ marginBottom: '20px' }}>
                        <div
                            className="refresh-form"
                            style={{ display: 'inline' }}
                        >
                            <button
                                className="btn btn-info refresh"
                                onClick={() => this.refresh()}
                            >
                                Refresh{' '}
                                {this.state.loaders.refresh ? (
                                    <span className="loading" />
                                ) : (
                                    ''
                                )}
                            </button>
                        </div>
                    </div>

                    {this.state.game >= 0 ? (
                        <React.Fragment>
                            <h2>Game #{this.state.game}</h2>

                            <table>
                                <tbody>
                                    {[0, 1, 2].map(i => (
                                        <tr key={i}>
                                            {[0, 1, 2].map(j => (
                                                <td
                                                    key={i * 3 + j}
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        textAlign: 'center',
                                                        verticalAlign: 'middle',
                                                    }}
                                                    onClick={() =>
                                                        this.playMove(i * 3 + j)
                                                    }
                                                >
                                                    {this.getField(i * 3 + j)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <fieldset className="form-group">
                                <label
                                    htmlFor="opponent"
                                    style={{ width: '200px' }}
                                >
                                    Opponent address:
                                </label>
                                <input
                                    id="opponent"
                                    onChange={e => this.onChange(e)}
                                    type="text"
                                    placeholder="Address"
                                    name="opponent"
                                    className="form-control"
                                />
                                <span
                                    className="btn btn-primary generate"
                                    onClick={() => this.startGame()}
                                >
                                    Start new game
                                </span>
                            </fieldset>
                            OR
                            <fieldset className="form-group">
                                <label
                                    htmlFor="opponent"
                                    style={{ width: '200px' }}
                                >
                                    Game ID:
                                </label>
                                <input
                                    id="gameId"
                                    onChange={e => this.onChange(e)}
                                    type="text"
                                    placeholder="Game ID"
                                    name="gameId"
                                    className="form-control"
                                />
                                <span
                                    className="btn btn-primary generate"
                                    onClick={() => this.loadGame()}
                                >
                                    Load existing game
                                </span>
                            </fieldset>
                        </React.Fragment>
                    )}

                    {this.state.tx ? (
                        <React.Fragment>
                            <h2>Transaction</h2>

                            <div className="grid">
                                <div className="cell -12of12">
                                    <textarea
                                        style={{ width: '100%' }}
                                        rows="18"
                                        id="signed-tx"
                                        disabled={true}
                                        value={JSON.stringify(
                                            this.state.tx,
                                            null,
                                            4
                                        )}
                                    />
                                </div>
                            </div>

                            <br />

                            <div className="grid">
                                <div className="cell -12of12">
                                    <button
                                        className="btn btn-success btn-block relay"
                                        disabled={!this.state.tx}
                                        onClick={() => this.relayTx()}
                                    >
                                        Sign and broadcast transaction{' '}
                                        {this.state.loaders.relay ? (
                                            <span className="loading" />
                                        ) : (
                                            ''
                                        )}
                                    </button>
                                </div>
                            </div>
                        </React.Fragment>
                    ) : null}
                </div>
            </React.Fragment>
        )
    }
}

export default Account
