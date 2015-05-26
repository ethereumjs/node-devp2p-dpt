const tape = require('tape');
const DHT = require('../index.js');
const crypto = require('crypto');
const async = require('async');

const port = 30306;
const numOfNode = 16;

var nodes = [];

function setup(cb) {
  for (var i = 0; i < numOfNode; i++) {
    var dht = new DHT({
      address: '0.0.0.0',
      udpPort: port + i,
      secretKey: crypto.randomBytes(32)
    });
    nodes.push(dht);
  }

  async.each(nodes, function(node, done) {
    node.bind(node.udpPort, '0.0.0.0', done);
  }, cb);
}

function printNodes() {
  console.log('------------');
  nodes.forEach(function(node, i) {
    console.log(i + ': ' + node.kBucket.count());
  });
}

function connect(cb) {
  nodes[0].ping({
    address: '0.0.0.0',
    port: port + 1
  }, function() {
    console.log('connect');
    cb()
  });
}

function bootStrap(cb) {
  var bootNodes = nodes.slice(2);
  var i = 1;
  async.eachSeries(bootNodes, function(node, done) {
    printNodes();
    node.bootStrap([{
      address: '0.0.0.0',
      port: port + i
    }], function() {
      setTimeout(done, 100)
    })
  }, cb);
}

function shutDown(cb){
  async.each(nodes, function(n, done){
    n.close(done);
  }, cb);
}

async.series([
  setup,
  connect,
  bootStrap,
], function() {
  printNodes();
  shutDown();
})
