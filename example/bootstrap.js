const DPT = require('../index')
const PRIVATE_KEY = 'd772e3d6a001a38064dd23964dd2836239fa0e6cec8b28972a87460a17210fe9'

const dpt = new DPT({
  secretKey: new Buffer(PRIVATE_KEY, 'hex'),
  port: 30301
})

dpt.on('error', function (err) {
  console.log(`DPT error: ${err.stack}`)
})

dpt.on('newPeer', function (peer) {
  console.log(`New peer: ${peer.address}:(${peer.udpPort},${peer.tcpPort}) ${peer.id.toString('hex')}`)
})

dpt.on('removePeer', function (peer) {
  console.log(`Remove peer: ${peer.address}:(${peer.udpPort},${peer.tcpPort}) ${peer.id.toString('hex')}`)
})

dpt.on('ping', function (data) {
  console.log(`ping received: ${JSON.stringify(data)}`)
})

dpt.on('pong', function (data) {
  console.log(`pong received: ${JSON.stringify(data)}`)
})

dpt.on('findNode', function (data) {
  console.log(`findNode received: ${JSON.stringify(data)}`)
})

dpt.on('neighbors', function (data) {
  console.log(`neighbors received: ${JSON.stringify(data)}`)
})

dpt.bind()
dpt.bootStrap([
  {
    address: '52.16.188.185',
    port: 30303
  },
  {
    address: '54.94.239.50',
    port: 30303
  },
  {
    address: '52.74.57.123',
    port: 30303
  },
  {
    address: '5.1.83.226',
    port: 30303
  }
], (err) => {
  if (!err) return
  console.log(`Bootstrap error: ${err.stack}`)
  process.exit(1)
})
