import { RpcClient } from 'tendermint'

import { hash, convertSignature, sortJson } from './util'

import axios from 'axios'
import { ec } from 'elliptic'
import bech32 from 'bech32'

const secp256k1 = new ec('secp256k1')

const prefix = 'cosmos'
const chainId = 'ttt'

const getAddress = pubkey => {
    let bytes = hash('ripemd160', hash('sha256', Buffer.from(pubkey, 'hex')))

    return bech32.encode(prefix, bech32.toWords(bytes))
}

const signTx = async (privateKey, tx) => {
    let state = (await axios.get(`http://localhost:1317/auth/accounts/${getAddress(secp256k1.keyFromPrivate(privateKey, 'hex').getPublic(true, 'hex'))}`)).data

    if (state) {
        state = JSON.parse(state)
    } else {
        state = {
            value: {},
        }
    }

    let jsonHash = hash(
        'sha256',
        Buffer.from(
            JSON.stringify({
                account_number: state.value.account_number || '0',
                chain_id: chainId,
                fee: sortJson(tx.value.fee),
                memo: tx.value.memo,
                msgs: sortJson(tx.value.msg[0].value),
                sequence: state.value.sequence || '0',
            }),
            'utf8'
        )
    )

    return {
        pub_key: {
            type: 'tendermint/PubKeySecp256k1',
            value: Buffer.from(
                secp256k1
                    .keyFromPrivate(privateKey, 'hex')
                    .getPublic(true, 'hex'),
                'hex'
            ).toString('base64'),
        },
        signature: convertSignature(
            secp256k1.sign(jsonHash, privateKey, 'hex', {
                canonical: true,
            })
        ).toString('base64'),
    }
}

const TicTacToeAPI = function(opts) {
    let handlers = {}

    let nodes = opts.nodes

    if (!nodes || !nodes.length) {
        throw Error('Invalid nodes array.')
    }

    this.rest = opts.rest

    this.retryCounter = 0
    this.isReconnnecting = false

    this.connectRpc = () => {
        this.rpcClient = RpcClient(
            nodes[Math.floor(Math.random() * nodes.length)]
        )

        this.rpcClient.removeAllListeners()

        this.rpcClient.subscribe(["tm.event='NewBlock'"], data => {
            if (handlers['block'] && typeof handlers['block'] === 'function') {
                handlers['block'](data)
            }

            this.retryCounter = 0
        })

        this.rpcClient.subscribe(["tm.event='Tx'"], data => {
            if (handlers['tx'] && typeof handlers['tx'] === 'function') {
                handlers['tx'](data)
            }

            this.retryCounter = 0
        })

        this.rpcClient.on('error', error => {
            if (this.isReconnnecting) {
                return
            }

            this.isReconnnecting = true

            setTimeout(() => {
                if (this.retryCounter++ < 10) {
                    console.log(
                        `[INFO] Reconnecting ${this.retryCounter}. time.`
                    )

                    this.connectRpc()

                    this.isReconnnecting = false
                } else throw new Error('[ERR] Reconnecting failed.')
            }, this.retryCounter * 1000)
        })
    }

    this.connectRpc()

    this.events = {
        onTx: fnc => {
            if (fnc && typeof fnc === 'function') {
                handlers['tx'] = fnc
            } else {
                throw Error('Invalid function.')
            }
        },
        onBlock: fnc => {
            if (fnc && typeof fnc === 'function') {
                handlers['block'] = fnc
            } else {
                throw Error('Invalid function.')
            }
        },
        removeHandler: type => {
            delete handlers[type]
        },
    }

    this.main = {
        startGame: async (privateKey, opponent) => {
            let result = await axios.post(`${this.rest}/tictactoe/game`, JSON.stringify({
                base_req: {
                    chain_id: 'ttt',
                    from: this.util.getAddressByPrivateKey(privateKey)
                },
                owner: this.util.getAddressByPrivateKey(privateKey),
                amount: {
                    denom: 'abc', 
                    amount: '0'
                },
                opponent: opponent
            }))

            return result.data
        },
        playMove: async (privateKey, game, field) => {
            let result = await axios.post(`${this.rest}/tictactoe/game/${game}/play`, JSON.stringify({
                base_req: {
                    chain_id: 'ttt',
                    from: this.util.getAddressByPrivateKey(privateKey)
                },
                player: this.util.getAddressByPrivateKey(privateKey),
                field: String(field)
            }))

            return result.data
        },
        gameStatus: async (game) => {
            let result = await axios.get(`${this.rest}/tictactoe/game/${game}`)

            return result.data
        }
    }

    this.util = {
        getAddressByPrivateKey: privateKey => {
            if (!privateKey || typeof privateKey !== 'string') {
                throw Error('Invalid private key.')
            }

            if (privateKey.startsWith(prefix)) {
                return privateKey
            }

            return getAddress(
                secp256k1.keyFromPrivate(privateKey, 'hex').getPublic(true, 'hex')
            )
        },
        getAddressByPublicKey: publicKey => {
            if (!publicKey || typeof publicKey !== 'string') {
                throw Error('Invalid public key.')
            }

            return getAddress(publicKey)
        },
        generateKeyPair: () => {
            const key = secp256k1.genKeyPair()

            return {
                privateKey: key.getPrivate('hex'),
                publicKey: key.getPublic(true, 'hex'),
                address: getAddress(key.getPublic(true, 'hex')),
            }
        },
        signTransaction: async (privateKey, tx, broadcast = true) => {
            if (!privateKey || typeof privateKey !== 'string') {
                throw Error('Invalid private key.')
            }

            if (!tx) {
                throw Error('Invalid transaction.')
            }

            tx.value.signatures = tx.value.signatures || []

            tx.value.signatures.push(await signTx(privateKey, tx))

            if (broadcast) {
                let res = await axios.post(`${this.rest}/txs`, {
                    tx: tx.value,
                    return: 'block'
                })

                return res.data
            } else {
                return JSON.stringify(tx, null, 4)
            }
        }
    }
}

export default TicTacToeAPI
