const DHT = require('../index.js');

var dht = new DHT({
  secretKey: new Buffer('d772e3d6a001a38064dd23964dd2836239fa0e6cec8b28972a87460a17210fe9', 'hex'),
  timeout: 6000
});

dht.socket.on('message', function(msg, rinfo) {
  console.log('server got msg from ' + rinfo.address + ":" + rinfo.port);
});

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
  // neighbors.forEach(function(n) {
  //   console.log('adding: ' + n.id.toString('hex'));
  // });
});

dht.on('newPeer', function(peer) {
  dht.findNodes(dht.id, peer, function(neighbors){
    console.log(neighbors); 
  });
});

dht.on('removePeer', function(neighbors, peer) {
  console.log('remove Node----');
});

dht.on('error', function(e) {
  console.log('error: ' + e );
});

dht.bind(30301, '0.0.0.0');

const bootStrapAddress = '46.28.202.24';
const bootStrapPort = 30303;
const introPeer = {
  address: bootStrapAddress,
  port: bootStrapPort
};

dht.ping(introPeer, function(){
  console.log("value");

});

// dht.bootStrap([introPeer], function() {
//   console.log('done bootStraping');
// });
