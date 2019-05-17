# Tic Tac Toe Frontend

This project uses NodeJS. If you don't have NodeJS installed, please check [this](https://nodejs.org/en/download/current/) out before continuing.

## Steps to run the application

### 1. Start the blockchain
1. Clone the [tic_tac_toe](http://github.com/Sentrylink/tic_tac_toe) repository.
2. Install Go binaries (if you don't have Go installed, check [this](https://golang.org/doc/install) out)
```
make install
```
3. Run the blockchain
```
./restart.sh
```

The blockchain RPC API will be available on [http://localhost:26657](http://localhost:26657).

### 2. Start the REST API server
Execute the following command in the root of `tic_tac_toe` repository:
```
tttcli rest-server --chain-id ttt
```

The REST API will be available on [http://localhost:1317](http://localhost:1317).

### 3. Start NGINX reverse proxy
Since the REST API server doesn't support CORS, we have to put it behind a proxy.

If you don't have NGINX installed, check [this](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/) out.

1. Copy `nginx/ttt.conf` to `/etc/nginx/conf.d/`
2. (Re)start NGINX
```
sudo service nginx restart
```

The proxied REST API will be available on [http://localhost:1318](http://localhost:1318).

### 4. Install NPM dependencies
This step should only be executed the first time you're running the app.
```
npm install
```

## 5. Start the app
```
npm start
```

The app will be available on [http://localhost:3000](http://localhost:3000).