# Demo application for MXW blockchain
A simple React application that shows abilities of MXW blockchain. It includes wallet keypair generation, requesting KYC verification, requesting coins from the faucet account, setting an alias and sending coins to other wallet addresses or aliases. It also has an integrated block explorer and transaction explorer.

It uses [mxw-api](https://www.npmjs.com/package/mxw-api) SDK package to communicate with MXW blockchain.

## Usage

## With Docker

### 1. Build/Pull the Docker image
If you want to run this example from a Docker image, you'll either have to pull the Docker image from Docker Hub by using:
```
docker pull anbud/wallet
```

or you can build it yourself from this repository by executing:
```
docker build -t anbud/wallet .
```

### 2. Run the application
You can run the application by executing:
```
docker run -p 3000:3000 --name wallet -d anbud/wallet
```

If you want to use custom nodes as the blockchain backend, you need to pass a comma-separated list of nodes (ip:port) to the start script.
You can do it by running the container in the following manner:
```
docker run -p 3000:3000 --name wallet -d anbud/wallet /bin/sh -c "npm start --nodes localhost:26657"
 ```

### 2a. Stop the application
If you want to stop the application, issue the following commands:
```
docker stop wallet
docker rm wallet
```

## Without Docker

### 0. Install NodeJS
This application uses NodeJS and ReactJS. If you don't have NodeJS installed, you'll have to install it now. If you do, you can skip this step.

Here's a list of guides on how to install NodeJS on a couple of different platforms:
- [Installing NodeJS on Linux](https://tecadmin.net/install-latest-nodejs-npm-on-ubuntu/)
- [Installing NodeJS on Windows](https://www.guru99.com/download-install-node-js.html)
- [Installing NodeJS on OSX](http://osxdaily.com/2018/06/29/how-install-nodejs-npm-mac/)

Please note that we recommend that you install and use the latest possible version (_currently 11.x_) to ensure that everything works correctly. If you use older versions, some parts of the application may not work.

Check if NodeJS had been installed successfully by running:
```
node -v && npm -v
```

It should return something like: 
```
v11.5.0
6.4.1
```

### 1. Install dependencies
Before running the application, you'll have to install its dependencies.

Installing dependencies is as simple as running:
```
npm install
```

### 2. Run the application
After installing dependencies, you can run the application like this:
```
npm start
```

This will create an instance of the application that connects to MXW testnet. If you want to test out the application with a custom MXW blockchain node (e.g. the one you've deployed), start it like this:

```
npm start --nodes ip:port
```

After running the command, a browser windows should open automatically with the running instance of the application. If, for whatever reason, it doesn't appear, you can visit the app [here](http://localhost:3000/).