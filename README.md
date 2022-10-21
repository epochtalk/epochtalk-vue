# epochtalk-vue

## Project setup from scratch

### Install system dependencies

* homebrew
  * install postgresql
  * install redis
  * install asdf
* setup postgresql
  * `
  CREATE USER postgres SUPERUSER;
  CREATE DATABASE postgres WITH OWNER postgres;
  `
* setup asdf
  * edit `~./zshrc` and add line to EOF `. $HOME/.asdf/asdf.sh`
* setup node, elixir
  * `asdf plugin add nodejs`
  * `asdf plugin add erlang`
  * `asdf plugin add elixir`
* install project specific versions of node and elixir
  * change directories into `epochtalk-vue` project
  * run `asdf install`

### Setup epoch database

* checkout epoch `git clone git@github.com:epochtalk/epoch.git`
* change directories to epoch project `cd epoch`
* make sure correct version of elixir is installed `asdf install`
* install deps `mix deps.get`
* run epochtalk database migration `mix ecto.setup`

### Setup old epochtalk project to run as server

* checkout epochtalk `git clone git@github.com:epochtalk/epochtalk.git`
* change directories to epochtalk project `cd epochtalk`
* install deps `yarn install`
* install project specific versions of system deps `asdf install`
* create admin user
  * `create-user <username> <email> --password <password> --admin`
  * if this fails, attempt to start epochtalk server with and try again
* copy `example.env` to `.env`
* edit `.env`
  * comment out `line 40` `# WEBSOCKET_SERVER_KEY_NAME=server.key`
  * comment out `line 41` `# WEBSOCKET_SERVER_CERT_NAME=server.crt`
  * comment out first section of emailer options `lines 52-62`
    * fill out section section your email information (need to check email provider for info on how to setup smtp)
  * change `line 34` `WEBSOCKET_SECURE=true` to `WEBSOCKET_SECURE=false`
* enable cors so vue project can access server, edit `/server/server-options.js`
  * inside of the `route` object, add the following code
  ```
  cors: {
    origin: ['*'],
    additionalHeaders: ['cache-control', 'x-requested-with']
  },
  ```
* start the server `yarn serve`

### Start vue project
* change directories into `epochtalk-vue`
* setup environment variables `cp example.env .env`
* run the server `yarn serve`
* to access new site visit `localhost:8000`
* to access old site/admin panel visit `localhost:8080`

## Standard setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
