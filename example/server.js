const DHT = require('../index.js');

var dht = new DHT({
  secretKey: new Buffer('d772e3d6a001a38064dd23964dd2836239fa0e6cec8b28972a87460a17210fe9', 'hex'),
  timeout: 6000
    //address
});

// dht.socket.on('message', function(msg, rinfo) {
//   // console.log('server got msg from ' + rinfo.address + ":" + rinfo.port);
// });

dht.on('ping', function(ping, peer) {
  console.log('got ping ---- ');
  console.log('peerId: ' + peer.id.toString('hex'));
});

dht.on('pong', function(pong, peer) {
  console.log('got pong: ' + peer);
});

dht.on('findNode', function(findNode, peer) {
  console.log('findNode----');
  console.log(findNode.id.toString('hex'));
});

dht.on('neighbors', function(neighbors, peer) {
  console.log('neighbors----');
  neighbors.forEach(function(n) {
    console.log('adding: ' + n.id.toString('hex'));
  });
});

dht.on('error', function() {
  console.log('Leeeeeeeeeeeeeroy!');
});

dht.bind(30301, '0.0.0.0');
