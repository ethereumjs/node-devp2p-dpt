const DHT = require('../index.js');
const port = 30306;
const privateKey = new Buffer('18f9226f2b10bafffbe7fe2a864b220eade9f6b76b44b71925653089c581485e', 'hex');

var dht = new DHT({
  port: port,
  secretKey: privateKey
}, null, 'should consturct');

dht.bind(port, '0.0.0.0');
