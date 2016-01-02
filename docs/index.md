# addPeer

[lib/index.js:385-390](https://github.com/ethereum/node-devp2p-dpt/blob/2afdf898f095c9e69e278f09a65321927b7e971c/lib/index.js#L385-L390 "Source code on GitHub")

**Parameters**

-   `peer`  {Object} and array of peers (POJO containing ip,  port and id) to connect to

# bind

[lib/index.js:136-138](https://github.com/ethereum/node-devp2p-dpt/blob/2afdf898f095c9e69e278f09a65321927b7e971c/lib/index.js#L136-L138 "Source code on GitHub")

bind the upd socket to `this.udpPort` and `this.address`

# bootStrap

[lib/index.js:372-379](https://github.com/ethereum/node-devp2p-dpt/blob/2afdf898f095c9e69e278f09a65321927b7e971c/lib/index.js#L372-L379 "Source code on GitHub")

connects to an array of nodes. Then does a `lookup` on `this.id` to populate
the table

**Parameters**

-   `peers`  {Array} and array of peers (POJO containing ip & port) to connect to
-   `cb`  

# close

[lib/index.js:144-147](https://github.com/ethereum/node-devp2p-dpt/blob/2afdf898f095c9e69e278f09a65321927b7e971c/lib/index.js#L144-L147 "Source code on GitHub")

closes the udp socket and clears any timers

# findPeers

[lib/index.js:323-364](https://github.com/ethereum/node-devp2p-dpt/blob/2afdf898f095c9e69e278f09a65321927b7e971c/lib/index.js#L323-L364 "Source code on GitHub")

TODO: add option to stop searching once an ID is found
does a recusive `findNodes` for an given ID

**Parameters**

-   `id`  {String} the id to search for
-   `cb`  {Function}

# ping

[lib/index.js:199-238](https://github.com/ethereum/node-devp2p-dpt/blob/2afdf898f095c9e69e278f09a65321927b7e971c/lib/index.js#L199-L238 "Source code on GitHub")

pings a peer and wait for the pong

**Parameters**

-   `peer`  {Peer}
-   `cb`  {}

# refresh

[lib/index.js:396-402](https://github.com/ethereum/node-devp2p-dpt/blob/2afdf898f095c9e69e278f09a65321927b7e971c/lib/index.js#L396-L402 "Source code on GitHub")

refreshes a the peers by asking them for more peers

# parse

[lib/index.js:37-79](https://github.com/ethereum/node-devp2p-dpt/blob/2afdf898f095c9e69e278f09a65321927b7e971c/lib/index.js#L37-L79 "Source code on GitHub")

Parsing Functions

# util

[lib/index.js:11-11](https://github.com/ethereum/node-devp2p-dpt/blob/2afdf898f095c9e69e278f09a65321927b7e971c/lib/index.js#L11-L11 "Source code on GitHub")

Implements ethereum's DPT

Peer stucuture
{
  id: Buffer
  address: String
  port: int
}
