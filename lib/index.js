/**
 * Implements ethereum's DHT 
 *
 * Peer stucuture
 * {
 *   id: Buffer
 *   address: String
 *   port: int
 * }
 */
const util = require('util');
const dgram = require('dgram');
const ethUtil = require('ethereumjs-util');
const KBucket = require('k-bucket');
const rlp = require('rlp');
const ecdsa = require('secp256k1');
const Semaphore = require('semaphore'); 
const assert = require('assert');
const EventEmitter = require('events').EventEmitter;
const dhtLogic = require('./logic.js');
const async = require('async');

/**
 * Parsing Functions
 */
const parse = {
  ping: function(payload) {
    return {
      version: payload[0],
      address: payload[1].toString(),
      port: ethUtil.bufferToInt(payload[2]),
      expiration: ethUtil.bufferToInt(payload[3])
    }
  },
  pong: function(payload) {
    return {
      hash: payload[0],
      expiration: payload[1]
    };
  },
  findNode: function(payload) {
    return {
      id: payload[0],
      expiration: payload[1]
    };
  },
  neighbors: function(payload) {
    var neighbors = [];
    payload[0].forEach(function(n) {
      neighbors.push({
        id: n[2],
        address: n[0].toString(),
        port: ethUtil.bufferToInt(n[1])
      });
    });
    return neighbors;
  }
};

var offsets = {
  0x01: 'ping',
  0x02: 'pong',
  0x03: 'findNode',
  0x04: 'neighbors'
};

var DHT = module.exports = function(opts) {

  const self = this;
  EventEmitter.call(this);

  //default settings defined by protocol
  this.setMaxListeners(40);
  this.version = 3;
  this.K = 16;
  this.concurrencySem = Semaphore(3);

  //settings defined by `opts`
  this.socket = dgram.createSocket('udp4') || opts.socket;
  this.timeout = opts.timeout || 6000;
  this.secKey = opts.secretKey;
  this.address = opts.address || '127.0.0.1';
  this.port = opts.port || 30303;
  this.id = (ecdsa.createPublicKey(this.secKey)).slice(1);

  this.kBucket = new KBucket({
    numberOfNodesPerKBucket: this.K,
    localNodeId: this.id
  });

  this.socket.on("message", function(msg, rinfo) {
    try{
      self.parsePacket(msg, rinfo);
    }catch(e){
      self.emit('error', 'failed to parse message', e, rinfo);
    }
  });

  this.socket.on("error", function (e) {
    self.emit('error', e);
  });

  //attach logic
  dhtLogic(this);
};

util.inherits(DHT, EventEmitter);

DHT.prototype.bind = function(port, address){
  this.port = port || this.port;
  this.socket.bind({port: this.port, address: address});
}

DHT.prototype.close = function(){
  this.socket.close();
}

//parse a packet
DHT.prototype.parsePacket = function(raw, rinfo) {
  const self = this;
  const hash = raw.slice(0, 32);
  const sig = raw.slice(32, 96);
  const recvId = raw.slice(96, 97);
  const type = raw.slice(97, 98);
  const data = rlp.decode(raw.slice(98));
  const h = ethUtil.sha3(raw.slice(32));

  if(h.toString('hex') !== hash.toString('hex')){
    this.emit('error', 'invalid hash; verification failed', rinfo);
  }else{
    const signHash = ethUtil.sha3(raw.slice(97));
    rinfo.id = ecdsa.recoverCompact(signHash, sig, ethUtil.bufferToInt(recvId), false).slice(1);
    const typeName = offsets[ethUtil.bufferToInt(type)]
    const parsed = parse[typeName](data);
    this.emit(typeName, parsed, rinfo)
  }
}

//send a packet
DHT.prototype.sendPacket = function(type, data, peer, cb) {
  //added expriation
  const t = Math.floor(new Date() / 1000) + 60;
  data.push(ethUtil.intToBuffer(t));
  type = new Buffer([type]);
  const typeData = Buffer.concat([type, rlp.encode(data)]);
  const signHash = ethUtil.sha3(typeData);
  const sig = ecdsa.signCompact(this.secKey, signHash);
  const recvId = new Buffer([sig.recoveryId]);
  const hashData = Buffer.concat([sig.signature, recvId, typeData]);
  const hash = ethUtil.sha3(hashData);
  const packet = Buffer.concat([hash, hashData]);
  this.socket.send(packet, 0, packet.length, peer.port, peer.address, cb);
}

//pings a peer and wait for the pong
DHT.prototype.ping = function(peer, cb) {

  if(!cb) cb = function(){};

  const self = this;
  var toID;
  var hash;

  function recFunc(pong, rpeer) {
    clearTimeout(toID);
    self.removeListener('pong', recFunc);
    if (pong.hash.toString('hex') !== hash.toString('hex')) {
      cb(new Error('invalid hash in pong'), rpeer);
    } else {
      //adde peer to kBucket
      rpeer.ip = peer.ip;
      rpeer.port = peer.port;
      self.kBucket.add(rpeer);
      self.emit('newPeer', rpeer);
      cb(undefined, rpeer);
    }
  }

  this.on('pong', recFunc)
  hash = this._ping(peer);

  toID = setTimeout(function() {
    self.removeListener('pong', recFunc);
    self.kBucket.remove(peer);
    cb('peer timed out');
  }, this.timeout);
}

DHT.prototype.findNodes = function(id, peer, cb) {
  var self = this;
  var toID;
  var hash;

  function recFunc(neighbors, rpeer) {
    clearTimeout(toID);
    self.removeListener('neighbors', recFunc);
    cb(null, neighbors, rpeer);
  }
  this.on('neighbors', recFunc)
  hash = this._findNodes(id, peer);

  toID = setTimeout(function() {
    self.removeListener('neighbors', recFunc);
    self.kBucket.remove(peer);
    cb('timed out', []);
  }, this.timeout);
}

//send a ping
//returns that hash
DHT.prototype._ping = function(peer, cb) {
  const data = [new Buffer([this.version]), new Buffer(this.address), ethUtil.intToBuffer(this.port)];
  this.sendPacket(1, data, peer, cb);
  return ethUtil.sha3(rlp.encode(data));
}

//send a pong given a ping
DHT.prototype._pong = function(ping, peer, cb) {
  const hash = ethUtil.sha3(rlp.encode([ping.version, new Buffer(ping.address), ethUtil.intToBuffer(ping.port), ethUtil.intToBuffer(ping.expiration)]));
  const data = [hash];
  this.sendPacket(2, data, peer, cb);
};

//send the `findNode` message
DHT.prototype._findNodes = function(id, peer, cb) {
  const data = [id];
  this.sendPacket(3, data, peer, cb);
};

//sends the neighbors packets given an array of neighbors
DHT.prototype._neighbors = function(neighbors, peer, cb) {
  var ndata = [];
  neighbors.forEach(function(n) {
    ndata.push([n.address, n.port, n.id])
  });

  this.sendPacket(4, [ndata], peer, cb);
}

/**
 * @method does a recusive lookup for an given ID
 * @param id {String} the id to search for
 * @param cb
 * TODO: add option to stop searching once an ID is found
 */
DHT.prototype.lookup = function(id, cb) {

  var queried = {};
  var self = this;

  lookup(cb);

  function lookup(cb2) {
    var cpeer = self.kBucket.closest({
      id: id
    }, self.K).filter(function(contact) {
      return !queried[contact.id.toString('hex')]
    });

    async.each(cpeer, function(peer, cb3){
      query(peer, cb3);
    }, cb2);
  }

  function query(peer, cb2) {
    queried[peer.id.toString('hex')] = true;
    self.concurrencySem.take(function(){
      self.findNodes(id, peer, function(err, neighbors) {
        self.concurrencySem.leave();
        lookup(cb2);
      });
    });
  }
};

/**
 * connects to an array of nodes. Then does a `lookup` on `this.id` to populate
 * the table
 * @method bootStrap
 * @param peers {Array} and array of peers (POJO containing ip & port) to connect to
 */
DHT.prototype.bootStrap = function(peers, cb){
  var self = this;
  async.each(peers, function(p, cb2){
    self.ping(p, function(err, rpeer){
      if(!err){
        self.kBucket.add(rpeer);
        self.emit('newPeer', newContact);
      }
      cb2();
    }); 
  }, function(){
    self.lookup(self.id, cb);
  });
}
