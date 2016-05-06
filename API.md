# API

### RawPeer

  - `string` address
  - `number` port

### Peer

  - `Buffer` id
  - `string` address
  - `number` port
  - `Object` endpoint
    - `string` address
    - `number` udpPort
    - `number` tcpPort

<hr>

### Events

#### error

  - `Error` err

#### peer:add

  - `Peer` peer

#### peer:remove

  - `Peer` peer

<hr>

### constructor

  - `Object` options
    - `Buffer` privateKey
    - `function` [createSocket] - function for creating socket, by default `dgram.createSocket('udp4')` will be called
    - `number` [timeout] - request timeout, 60s by default
    - `number` [refreshInterval] - refresh interval, 5m by default
    - `Object` endpoint
      - `string` address
      - `number` udpPort
      - `?number` tcpPort - `null` for bootstrap node

### bind

  Similar to [node dgram bind](https://nodejs.org/api/dgram.html)

### close

  Similar to [node dgram close](https://nodejs.org/api/dgram.html#dgram_socket_close_callback)

### bootstrap

  - `RawPeer[]` peers
  - `function` callback

### addPeers

  - `RawPeer[]` peers
  - `function` callback

### getPeers

  **returns:** `Peer[]`

### removePeers

  - `Peer[]` peers

### refresh

  - `function` callback
