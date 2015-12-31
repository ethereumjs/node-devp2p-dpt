const DHT = require('../index.js')

var dht = new DHT({
  secretKey: new Buffer('d772e3d6a001a38064dd23964dd2836239fa0e6cec8b28972a87460a17210fe9', 'hex'),
  timeout: 6000,
  port: 30301,
  publicAddress: '50.102.233.66',
  address: '0.0.0.0'
})

dht.socket.on('message', function (msg, rinfo) {
  console.log('server got msg from ' + rinfo.address + ':' + rinfo.port)
})

dht.on('ping', function (ping, peer) {
  console.log('got ping ---- ')
  console.log('peerId: ' + peer.id.toString('hex'))
})

dht.on('pong', function (pong, peer) {
  console.log('got pong: ')
})

dht.on('findNode', function (findNode, peer) {
  console.log('findNode----')
  console.log(findNode.id.toString('hex'))
})

dht.on('neighbors', function (neighbors, peer) {
  console.log('neighbors----')
  neighbors.forEach(function (n) {
    console.log('adding: ' + n.id.toString('hex'))
  })
})

dht.on('removePeer', function (neighbors, peer) {
  console.log('remove Node----')
})

dht.on('error', function (e) {
  console.log('error: ' + e)
})

const bootStrapAddress = '127.0.0.1'
const bootStrapPort = 30303
const introPeer = {
  address: bootStrapAddress,
  port: bootStrapPort
}

// if you don't want a full boostrap
// dht.ping(introPeer, function () {
//   console.log('ping done')
// })

dht.bootStrap([introPeer], function () {
  console.log('done bootStraping')
})
