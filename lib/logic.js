const async = require('async');
const pingSem = require('semaphore')(3);

module.exports = function(dht) {
  dht.on('ping', function(ping, peer) {
    dht._pong(ping, peer);
  });

  dht.on('findNode', function(node, peer) {
    var nodes = dht.kBucket.closest(node, this.K);
    dht._neighbors(nodes, peer);
  });

  dht.on('neighbors', function(neighbors) {
    neighbors.forEach(function(n) {
      console.log('adding: ' + n.id.toString('hex'));
      dht.kBucket.add(n);
    });
  });

  dht.kBucket.on('ping', function(oldContacts, newContact) {
    var added = false

    oldContacts.forEach(function(c){
      if(!c.lastTalkedTo ||  c.lastTalkedTo < (new Date().getTime() - dht.evictionInterval)  ){
        dht.concurrencySem.take(function(){
          dht.ping(c, function(err) {
            if (err && !added) {
              dht.kBucket.remove(c);
              dht.kBucket.add(newContact);
              added = true;
            }
            dht.concurrencySem.leave();
          });
        });
      }
    });
  });
};
