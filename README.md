# SYNOPSIS [![Build Status](https://travis-ci.org/ethereum/node-devp2p-dpt.svg?branch=master)](https://travis-ci.org/ethereum/node-devp2p-dpt)
An node.js implementation of ethereum's DPT. 

# INSTALL  
`npm install devp2p-dpt` 

# EXAMPLE
For a basic example see [example/](example/)

# API
- [`DPT`](#DPT)
    - [`new DPT(options)`](#new-dpt-options)
    - [`DPT` methods](#network-methods)
      - [`dpt.bind([port], [address])`](#dptbindport-address)
      - [`dpt.close()`](#dptclose)
      - [`dpt.bootstrap(introPeers)`](#dptboostrapintropeers)
    - [`DPT` events](#dpt-events)

## DPT
### `new DPT(options)`
Create a New DPT with the following options
 -`options`
  - `secretKey` - a 32 byte `Buffer` from which the pubic key is derived
  - `timeout` - an Interger specifing the wait period in milliseconds to wait for peers to respond
  - `port` - the port external port that this peer is listening to. If not specifed the port that is used in `bound` will be used
  - `address` - the external address that this peer is listening  to. if not specifed the port that is used in `bound` will be used

### `DPT` methods
#### `dpt.bind(port, address, [cb])`
Binds the port
- `port` 
- `address`
- `cb` the callback

#### `dpt.close([cb])`
Unbinds the port

#### `dpt.bootstrap(introPeers, [cb])`
Bootstraps the DPT given an array of peers to connect to.
- `introPeers` - an `Array` of peers to try to connect to. They should be objects in following format.
```
{
  address: String
  port: Number
}
```

#### `dpt.refresh()`
Refreshes the nodes and searches for new nodes

### `DPT` events
The DPT object inherits from Events.EventEmitter and emits the following events. 
- `ping` - Fires when receiving a Ping. Provides a parsed ping packets and the peer it came from
- `pong` - Fires when receiving a pong. Provides a parsed ping packets and the peer it came from
- `findNode` - Fires when receiving a findNode. Provides a parsed ping packets and the peer it came from
- `neighbors`-  Fires when receiving a neighbors. Provides a parsed ping packets and the peer it came from
- `error` - Provides and error message 

# CONTRIBUTIONS

Patches welcome! Contributors are listed in the `package.json` file.
Please run the tests before opening a pull request and make sure that you are
passing all of them.

If you would like to contribute, but don't know what to work on, check
the issues list or ask on the forms or on IRC.

* [issues](http://github.com/ethereum/ethereumjs-lib/issues)
* [task tracker](https://waffle.io/ethereum/ethereumjs-lib)
* [forum](https://forum.ethereum.org/categories/node-ethereum)
* #ethereum-dev on irc.freenode.net

# BUGS

When you find issues, please report them:

* [web](http://github.com/ethereum/ethereumjs-dpt/issues)
* [email](mailto:mb@ethdev.com)

You can also look for null_radix in #ethereum-dev on irc://irc.freenode.net. 

# LISCENCE
GPL3
