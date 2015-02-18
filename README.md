# SYNOPSIS
An node.js implementation of ethereum's DHT. 

# EXAMPLE
For a basic node implementation see [bin/dht](bin/dht)

# API
- [`DHT`](#DHT)
    - [`new DHT(options)`](#new-dht-options)
    - [`DHT` methods](#network-methods)
      - [`dht.bootstrap(introPeers)`](#dhtboostrapintropeers)
    - [`DHT` events](#dht-events)

## DHT
### `new DHT(options)`
Create a New DHT with the following options
 -`options`
  - `secretKey` - a 32 byte `Buffer` from which the pubic key is derived
  - `timeout` - an Interger specifing the wait period in milliseconds to wait for peers to respond
  - `port` - the port to listen to given as an `Number`
  - `address` - the address to listen to given as a `String`
  - `externalPort`- the external port given as an `Number`
  - `externalAddress`- the external address given as an `String`

### `DHT` methods
#### `dht.bootstrap(introPeers)`
Bootstraps the DHT given an array of peers to connect to.
- `introPeers` - an `Array` of peers to try to connect to. They should be objects in following format.
```
{
  address: String
  port: Number
}
```

### `DHT` events
The DHT object inherits from Events.EventEmitter and emits the following events. 
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

* [web](http://github.com/ethereum/ethereumjs-dht/issues)
* [email](mailto:mb@ethdev.com)

You can also look for null_radix in #ethereum-dev on irc://irc.freenode.net. 

# LISCENCE
GPL3
