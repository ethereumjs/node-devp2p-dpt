const async = require('async')
const pingSem = require('semaphore')(3)

module.exports = function (dpt) {
  dpt.on('ping', function (ping, peer, raw) {
    ping.id = peer.id
    ping.port = ping.udpPort
    dpt.kBucket.add(ping)
    dpt._pong(raw, ping)
  })

  dpt.on('findNode', function (node, peer) {
    var nodes = dpt.kBucket.closest(node, this.K)
    dpt._neighbors(nodes, peer)
  })

  // dpt.on('neighbors', function(neighbors) {
  //   neighbors.forEach(function(n) {
  //     dpt.ping(n)
  //   })
  // })

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
              dpt.emit('newPeer', newContact)
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
