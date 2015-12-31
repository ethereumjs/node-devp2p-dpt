# Global





* * *

### bind() 

bind the upd socket to `this.udpPort` and `this.address`



### close() 

closes the udp socket and clears any timers



### ping(peer, cb) 

pings a peer and wait for the pong

**Parameters**

**peer**: `Peer`, pings a peer and wait for the pong

**cb**: , pings a peer and wait for the pong



### findPeerrs(id, cb) 

TODO: add option to stop searching once an ID is found
does a recusive `findNodes` for an given ID

**Parameters**

**id**: `String`, the id to search for

**cb**: `function`, TODO: add option to stop searching once an ID is found
does a recusive `findNodes` for an given ID



### bootStrap(peers) 

connects to an array of nodes. Then does a `lookup` on `this.id` to populate
the table

**Parameters**

**peers**: `Array`, and array of peers (POJO containing ip & port) to connect to



### addPeer(peer) 

**Parameters**

**peer**: `Object`, and array of peers (POJO containing ip,  port and id) to connect to



### refresh() 

refreshes a the peers by asking them for more peers




* * *










