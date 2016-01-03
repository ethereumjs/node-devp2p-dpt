const tape = require('tape')
const DHT = require('../index.js')
const crypto = require('crypto')

const port = 30306

tape('sanity checks', function (t) {
  var dht
  t.doesNotThrow(function () {
    dht = new DHT({
      port: port,
      secretKey: crypto.randomBytes(32)
    })
  })

  t.equals(dht.id.length, 64, 'the ID should be an uncompressed publickey for some godforsaken reason')

  t.doesNotThrow(function () {
    dht.close()
  }, null, 'should close')

  t.end()
})

tape('ping pong test', function (t) {
  var dht = new DHT({
    port: port,
    address: '0.0.0.0',
    secretKey: crypto.randomBytes(32)
  })

  dht.bind()

  var dht2 = new DHT({
    port: port + 1,
    address: '0.0.0.0',
    secretKey: crypto.randomBytes(32)
  })

  dht2.bind()

  dht2.ping({
    port: port,
    address: '0.0.0.0'
  }, function (err) {
    t.assert(err === undefined)
    dht.close()
    dht2.close()
    t.end()
  })
})
