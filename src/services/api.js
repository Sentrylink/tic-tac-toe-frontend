import TicTacToeAPI from './api/index'

const API = new TicTacToeAPI({
    nodes: process.env.NODES ? process.env.NODES.split(',') : ['ws://localhost:26657'],
    rest: process.env.REST || 'http://localhost:1317'
})

export default API