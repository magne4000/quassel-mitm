# quassel-mitm
The purpose of this tool is to ease the debugging of quassel clients. It stands between the core and the client.
All packets transiting through `quassel-mitm` will be printed to the console, in hexadecimal and interpreted json format.

## Installation
It requires at least `node>=4` in order to run
```sh
git clone https://github.com/magne4000/quassel-mitm.git
npm install
```

## Run
```sh
DEBUG=* node app.js
```
:warning: Do not forget `DEBUG=*`.

### Usage
```
  Usage: app [options]

  Options:

    -h, --help                   output usage information
    -V, --version                output the version number
    --quasselhost [quasselhost]  Quasselcore host (default: localhost)
    --quasselport [quasselport]  Quasselcore port (default: 4242)
    -p, --port [port]            Port on which the application listens (default: 64242)
```

### Start debugging
Once `quassel-mitm` is started, it listens to connection on port specified by `--port` (or `64242` by default).
In your client use this port instead of the port of quasselcore. Check `quassel-mitm` console. Profit !
