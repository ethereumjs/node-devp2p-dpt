# DPT

[lib/index.js:103-147](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L103-L147 "Source code on GitHub")

Creates a New DPT

**Parameters**

-   `opts`  The options object
    -   `opts.secretKey` **Buffer** a 32 byte Buffer from which the public key is derived
    -   `opts.port` **Interger** the port that this peer binds to
    -   `opts.address` **String** the external address that this peer is listening to
    -   `opts.timeout` **Interger** Specifies the wait period in milliseconds to wait for peers to respond. Defaults to 60000
    -   `opts.refreshIntervial` **Interger** Specifies the wiat period in milliseconds between refreshing the table. Defaults to 360000
    -   `opts.udpPort` **Interger** If the udp port and the tcp port are different then you need then use this option
    -   `opts.tcpPort` **Interger** If the udp port and the tcp port are different then you need then use this option
    -   `opts.publicUdpPort` **Interger** If your public udp port is different from the one you bind to then specify it here

## addPeer

[lib/index.js:425-430](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L425-L430 "Source code on GitHub")

**Parameters**

-   `peer` **Object** and array of peers (POJO containing ip,  port and id) to connect to

## bind

[lib/index.js:156-158](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L156-L158 "Source code on GitHub")

binds the upd socket to `this.udpPort` and `this.address`. This is called 
automatically by the constuctor.

## bootStrap

[lib/index.js:412-419](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L412-L419 "Source code on GitHub")

connects to an array of nodes. Then does a recusive `lookup` on `this.id` to populate
the table.

**Parameters**

-   `peers` **Array&lt;Peer&gt;** and array of peers (POJO containing ip & port) to connect to
-   `cb` **Function** 

## close

[lib/index.js:164-167](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L164-L167 "Source code on GitHub")

closes the udp socket and clears any timers

## findNodes

[lib/index.js:286-311](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L286-L311 "Source code on GitHub")

Sends the Finds nodes packet and waits for a response

**Parameters**

-   `id` **Buffer** 
-   `peer` **Peer** 
-   `cb`  

## findPeers

[lib/index.js:362-403](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L362-L403 "Source code on GitHub")

Does a recusive `findNodes` for an given ID

**Parameters**

-   `id` **String** the id to search for
-   `cb` **Function** 

## ping

[lib/index.js:239-278](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L239-L278 "Source code on GitHub")

pings a peer and wait for the pong

**Parameters**

-   `peer`  {Peer}
-   `cb`  {}

## refresh

[lib/index.js:436-442](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L436-L442 "Source code on GitHub")

refreshes a the peers by asking them for more peers

# Peer

[lib/index.js:10-10](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L10-L10 "Source code on GitHub")

**Properties**

-   `id` **Buffer** a 64 byte public key that is used as the peers id
-   `address` **String** the address of the peer
-   `port` **Integer** the remote port

# error

[lib/index.js:138-138](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L138-L138 "Source code on GitHub")

Provides and error message

# findNode

[lib/index.js:212-212](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L212-L212 "Source code on GitHub")

Fires when receiving a findNode. Provides a parsed findNode packet and the peer it came from

# neighbors

[lib/index.js:212-212](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L212-L212 "Source code on GitHub")

Fires when receiving a neighbors. Provides a parsed neighbors packets and the peer it came from

# ping

[lib/index.js:212-212](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L212-L212 "Source code on GitHub")

Fires when receiving a Ping. Provides a parsed ping packets and the peer it came from

# pong

[lib/index.js:212-212](https://github.com/ethereum/node-devp2p-dpt/blob/8c8e0a20a23495c828a67df5156aeddce8dc2060/lib/index.js#L212-L212 "Source code on GitHub")

Fires when receiving a pong. Provides a parsed pong packets and the peer it came from
