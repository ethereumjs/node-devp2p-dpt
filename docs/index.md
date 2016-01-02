# DPT

[lib/index.js:104-148](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L104-L148 "Source code on GitHub")

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

[lib/index.js:426-431](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L426-L431 "Source code on GitHub")

**Parameters**

-   `peer` **Object** and array of peers (POJO containing ip,  port and id) to connect to

## bind

[lib/index.js:157-159](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L157-L159 "Source code on GitHub")

binds the upd socket to `this.udpPort` and `this.address`. This is called
automatically by the constuctor.

## bootStrap

[lib/index.js:413-420](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L413-L420 "Source code on GitHub")

connects to an array of nodes. Then does a recusive `lookup` on `this.id` to populate
the table.

**Parameters**

-   `peers` **Array&lt;Peer&gt;** and array of peers (POJO containing ip & port) to connect to
-   `cb` **Function** 

## close

[lib/index.js:165-168](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L165-L168 "Source code on GitHub")

closes the udp socket and clears any timers

## findNodes

[lib/index.js:287-312](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L287-L312 "Source code on GitHub")

Sends the Finds nodes packet and waits for a response

**Parameters**

-   `id` **Buffer** 
-   `peer` **Peer** 
-   `cb`  

## findPeers

[lib/index.js:363-404](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L363-L404 "Source code on GitHub")

Does a recusive `findNodes` for an given ID

**Parameters**

-   `id` **String** the id to search for
-   `cb` **Function** 

## ping

[lib/index.js:240-279](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L240-L279 "Source code on GitHub")

pings a peer and wait for the pong

**Parameters**

-   `peer` **Peer** 
-   `cb` **Function** 

## refresh

[lib/index.js:437-443](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L437-L443 "Source code on GitHub")

refreshes a the peers by asking them for more peers

# Objects
## Peer

[lib/index.js:11-11](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L11-L11 "Source code on GitHub")

The peer object is used to decribe peer

**Properties**

-   `id` **Buffer** a 64 byte public key that is used as the peers id
-   `address` **String** the address of the peer
-   `port` **Integer** the remote port

# Events
## error

[lib/index.js:139-139](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L139-L139 "Source code on GitHub")

Provides and error message

## findNode

[lib/index.js:213-213](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L213-L213 "Source code on GitHub")

Fires when receiving a findNode. Provides a parsed findNode packet and the peer it came from

## neighbors

[lib/index.js:213-213](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L213-L213 "Source code on GitHub")

Fires when receiving a neighbors. Provides a parsed neighbors packets and the peer it came from

## ping

[lib/index.js:213-213](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L213-L213 "Source code on GitHub")

Fires when receiving a Ping. Provides a parsed ping packets and the peer it came from

## pong

[lib/index.js:213-213](https://github.com/ethereum/node-devp2p-dpt/blob/a87ac5d282d3a5d0fee309462b69240917f517c5/lib/index.js#L213-L213 "Source code on GitHub")

Fires when receiving a pong. Provides a parsed pong packets and the peer it came from
