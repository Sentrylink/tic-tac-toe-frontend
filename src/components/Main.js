import React, { Component } from 'react'
import API from 'services/api'

import Account from 'components/Account'

class Main extends Component {
    constructor() {
        super()

        this.state = {
            unlocked: false,
            privateKey: '',
        }
    }

    unlockAccount() {
        this.setState({
            unlocked: true,
        })
    }

    generateAccount() {
        const key = API.util.generateKeyPair()

        this.setState({
            unlocked: false,
            privateKey: key.privateKey,
        })
    }

    onChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        })
    }

    render() {
        return (
            <React.Fragment>
                <h2>Account</h2>

                <form style={{ width: '100%' }}>
                    <fieldset className="form-group">
                        <label htmlFor="private-key">PRIVATE KEY:</label>
                        <input
                            id="private-key"
                            onChange={e => this.onChange(e)}
                            type="text"
                            placeholder="Private key"
                            value={this.state.privateKey}
                            name="privateKey"
                            className="form-control"
                            disabled={this.state.unlocked}
                        />
                        <span
                            className="btn btn-primary generate"
                            onClick={() => this.generateAccount()}
                        >
                            Generate new account
                        </span>
                    </fieldset>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-primary btn-block unlock"
                            onClick={() => this.unlockAccount()}
                        >
                            Unlock account
                        </button>
                    </div>
                </form>
                {this.state.unlocked && (
                    <Account privateKey={this.state.privateKey} />
                )}
            </React.Fragment>
        )
    }
}

export default Main
