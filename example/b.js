const DHT = require('../index.js')
const port = 30307
const privateKey = new Buffer('18f9226f2b10bafffbe7fe2a864b220eade9f6b76b44b71925653089c581485e', 'hex')

var dht = new DHT({
  port: port,
  address: '0.0.0.0',
  secretKey: privateKey
}, null, 'should consturct')

console.log('id: ' + dht.id.toString('hex'))

dht.ping({
  port: 30306,
  address: '0.0.0.0'
})

dht.on('newPeer', function (neighbors, peer) {
  console.log('new Node----')
})
