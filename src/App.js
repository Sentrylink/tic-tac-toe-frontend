import React, { Component } from 'react'
import { Switch, Route, Link } from 'react-router-dom'
import { NotificationContainer } from 'react-notifications'

import API from 'services/api'

import Main from 'components/Main'

class App extends Component {
	constructor () {
        super()

        this.state = {}
    }

	componentDidMount () {
        API.events.onBlock(data => {
            this.setState({
                blockNumber: data.block.header.height
            })
        })
    }

    render() {
		return (
			<React.Fragment>
				<div className="container">
					<h1><Link to='/'>Tic Tac Toe</Link> { this.state.blockNumber ? <span className="block">(#{this.state.blockNumber})</span> : ('')}</h1>

					<Switch>
				        <Route exact path='/' component={Main}/>
				    </Switch>
				</div>

				<NotificationContainer/>
			</React.Fragment>
		)
  	}
}

export default App
