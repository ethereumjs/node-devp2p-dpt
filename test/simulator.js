const tape = require('tape')
const DHT = require('../index.js')
const crypto = require('crypto')
const async = require('async')

const localIp = '0.0.0.0'
const port = 30306
const numOfNode = 15

var nodes = []

function setup (cb) {
  for (var i = 0; i < numOfNode; i++) {
    var dht = new DHT({
      address: localIp,
      udpPort: port + i,
      secretKey: crypto.randomBytes(32)
    })
    dht.bind()
    nodes.push(dht)
  }

  cb()
}

function printNodes () {
  console.log('------------')
  nodes.forEach(function (node, i) {
    console.log(i + ': ' + node.kBucket.count())
  })
}

function checkNodes (t) {
  nodes.forEach(function (node, i) {
    t.equal(node.kBucket.count(), numOfNode - 1)
  })
}

function connect (cb) {
  nodes[0].ping({
    address: localIp,
    port: port + 1
  }, cb)
}

function bootStrap (cb) {
  var bootNodes = nodes.slice(2)
  var i = 1
  async.eachSeries(bootNodes, function (node, done) {
    printNodes()
    node.bootStrap([{
      address: localIp,
      port: port + i
    }], function () {
      setTimeout(done, 100)
    })
  }, cb)
}

function shutDown (cb) {
  async.each(nodes, function (n, done) {
    n.close()
    done()
  }, cb)
}

tape('running simulator', function (t) {
  async.series([
    setup,
    connect,
    bootStrap
  ], function () {
    printNodes()
    checkNodes(t)
    shutDown(t.end)
  })
})
