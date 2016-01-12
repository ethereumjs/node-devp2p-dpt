module.exports = function (dpt) {
  // Incoming ping
  dpt.on('ping', function (ping, peer, raw) {
    // NOTE: Workaround the case when the other node doesn't have NAT traversal
    // https://github.com/ethereum/go-ethereum/issues/2117
    if (ping.address === '0.0.0.0' || ping.address === '127.0.0.1' ||
        ping.address === '::' || ping.address === '::1') {
      ping.address = peer.address
    }
    ping.id = peer.id
    ping.port = ping.udpPort
    dpt.kBucket.add(ping)
    dpt._pong(raw, ping)
  })

  // Incoming findNode
  dpt.on('findNode', function (node, peer) {
    var nodes = dpt.kBucket.closest(node, this.K)
    dpt._neighbors(nodes, peer)
  })

  // Bucket is nearly full, lets sweep old nodes
  dpt.kBucket.on('ping', function (oldContacts, newContact) {
    var added = false
    oldContacts.forEach(function (c) {
      dpt.concurrencySem.take(function () {
        if (!added) {
          dpt.ping(c, function (err) {
            if (err) {
              dpt.kBucket.remove(c)
              dpt.kBucket.add(newContact)
              dpt.emit('removePeer', c)
              added = true
            }
            dpt.concurrencySem.leave()
          })
        } else {
          dpt.concurrencySem.leave()
        }
      })
    })
  })
}
