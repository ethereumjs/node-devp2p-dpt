const async = require('async');
const pingSem = require('semaphore')(3);

module.exports = function(dht) {
  dht.on('ping', function(ping, peer) {
    peer.address = ping.address;
    peer.port = ping.port;
    dht.kBucket.add(peer);
    dht._pong(ping, peer);
  });

  dht.on('findNode', function(node, peer) {
    var nodes = dht.kBucket.closest(node, this.K);
    dht._neighbors(nodes, peer);
  });

  // dht.on('neighbors', function(neighbors) {
  //   neighbors.forEach(function(n) {
  //     dht.ping(n);
  //   });
  // });

  dht.kBucket.on('ping', function(oldContacts, newContact) {
    var added = false
    oldContacts.forEach(function(c) {
      dht.concurrencySem.take(function() {
        if (!added) {
          dht.ping(c, function(err) {
            if (err) {
              dht.kBucket.remove(c);
              dht.kBucket.add(newContact);
              dht.emit('removePeer', c);
              dht.emit('newPeer', newContact);
              added = true;
            }
            dht.concurrencySem.leave();
          });
        } else {
          dht.concurrencySem.leave();
        }
      });
    });
  });
};
