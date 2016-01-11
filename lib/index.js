// Implements ethereum's DPT

/**
 * The peer object is used to decribe peer
 * @typedef {Object} Peer
 * @property {Buffer} id a 64 byte public key that is used as the peers id
 * @property {String} address the address of the peer
 * @property {Integer} port the remote port
 */

const util = require('util')
const dgram = require('dgram')
const ethUtil = require('ethereumjs-util')
const KBucket = require('k-bucket')
const rlp = require('rlp')
const ecdsa = require('secp256k1')
const Semaphore = require('semaphore')
const EventEmitter = require('events').EventEmitter
const dhtLogic = require('./logic.js')
const assert = require('assert')
const async = require('async')

function parseIp (ip) {
  var parsedIp = ip[0].toString() + '.' + ip[1].toString() + '.' + ip[2].toString() + '.' + ip[3].toString()
  parsedIp = parsedIp === '0.0.0.0' ? '127.0.0.1' : parsedIp
  return parsedIp
}

function createIp (str) {
  str = str.split('.')
  return new Buffer(str)
}

// Parsing Functions
const parse = {
  // skip src packet
  ping: function (payload) {
    return {
      version: payload[0],
      address: parseIp(payload[1][0]),
      udpPort: ethUtil.bufferToInt(payload[1][1]),
      tcpPort: ethUtil.bufferToInt(payload[1][2]),
      dstAddress: parseIp(payload[2][0]),
      dstUdpPort: ethUtil.bufferToInt(payload[2][1]),
      dstTcpPort: ethUtil.bufferToInt(payload[2][2]),
      expiration: ethUtil.bufferToInt(payload[3])
    }
  },
  pong: function (payload) {
    return {
      dstAddress: parseIp(payload[0][0]),
      dstUdpPort: ethUtil.bufferToInt(payload[0][1]),
      dstTcpPort: ethUtil.bufferToInt(payload[0][2]),
      hash: payload[1],
      expiration: payload[2]
    }
  },
  findNode: function (payload) {
    return {
      id: payload[0],
      expiration: payload[1]
    }
  },
  neighbors: function (payload) {
    var neighbors = []
    payload[0].forEach(function (n) {
      neighbors.push({
        address: parseIp(n[0]),
        udpPort: ethUtil.bufferToInt(n[1]),
        tcpPort: ethUtil.bufferToInt(n[2]),
        id: n[3]
      })
    // TODO: parse expriration date
    })
    return neighbors
  }
}

var offsets = {
  0x01: 'ping',
  0x02: 'pong',
  0x03: 'findNode',
  0x04: 'neighbors'
}

/**
 * Creates a New DPT
 * @class
 * @param opts The options object
 * @param {Buffer} opts.secretKey - a 32 byte Buffer from which the public key is derived
 * @param {Buffer} opts.id - the public key aka node id
 * @param {Interger} opts.port - the port that this peer binds to
 * @param {String} opts.address - the external address that this peer is listening to
 * @param {Interger} opts.timeout Specifies the wait period in milliseconds to wait for peers to respond. Defaults to 60000
 * @param {Interger} opts.refreshIntervial Specifies the wiat period in milliseconds between refreshing the table. Defaults to 360000
 * @param {Interger} opts.udpPort - If the udp port and the tcp port are different then you need then use this option
 * @param {Interger} opts.tcpPort - If the udp port and the tcp port are different then you need then use this option
 * @param {Interger} opts.publicUdpPort - If your public udp port is different from the one you bind to then specify it here
 * @fires error
 * @fires ping
 * @fires pong
 * @fires findNode
 * @fires neighbors
 */
var DPT = module.exports = function (opts) {
  const self = this
  EventEmitter.call(this)

  // default settings defined by protocol
  this.setMaxListeners(40)
  this.version = 4
  this.K = 16
  this.concurrencySem = Semaphore(3)

  // settings defined by `opts`
  this.socket = dgram.createSocket('udp4') || opts.socket
  this.timeout = opts.timeout || 60000
  this.secKey = opts.secretKey
  this.publicAddress = opts.publicAddress || opts.address || '0.0.0.0'
  this.address = opts.address || opts.publicAddress
  this.publicUdpPort = opts.publicUdpPort || opts.udpPort || opts.port
  this.udpPort = opts.udpPort || this.publicUdpPort || opts.tcpPort
  this.tcpPort = opts.tcpPort || this.udpPort
  this.id = opts.id || ecdsa.publicKeyConvert(ecdsa.publicKeyCreate(this.secKey), false).slice(1)
  this.refreshIntervial = opts.refreshIntervial || 360000
  this.kBucket = new KBucket({
    numberOfNodesPerKBucket: this.K,
    localNodeId: this.id
  })

  this.socket.on('message', function (msg, rinfo) {
    self.parsePacket(msg, rinfo)
  })

  this.socket.on('error', function (e) {
    /**
     * Provides and error message
     * @event error
     */
    self.emit('error', e)
  })

  // refreshes the peer table by asking for more peers
  this._refreshId = setInterval(this.refresh.bind(this), this.refreshIntervial)
  // attach logic
  dhtLogic(this)
}

util.inherits(DPT, EventEmitter)

/**
 * binds the upd socket to `this.udpPort` and `this.address`.
 * @method bind
 */
DPT.prototype.bind = function (port, address) {
  this.address = address = address || this.address
  this.udpPort = port = port || this.udpPort

  if (!this.publicUdpPort) {
    this.publicUdpPort = this.udpPort
  }

  if (!this.tcpPort) {
    this.tcpPort = this.udpPort
  }

  this.socket.bind({port: port, address: address})
}

/**
 * closes the udp socket and clears any timers
 * @method close
 */
DPT.prototype.close = function () {
  clearInterval(this._refreshId)
  this.socket.close()
}

// parse a packet
DPT.prototype.parsePacket = function (raw, rinfo) {
  const hash = raw.slice(0, 32)
  const signature = raw.slice(32, 96)
  const recovery = ethUtil.bufferToInt(raw.slice(96, 97))
  const type = raw.slice(97, 98)
  const rawData = raw.slice(98)
  const data = rlp.decode(rawData)
  const h = ethUtil.sha3(raw.slice(32))

  if (h.toString('hex') !== hash.toString('hex')) {
    this.emit('error', 'invalid hash verification failed', rinfo)
  } else {
    const signHash = ethUtil.sha3(raw.slice(97))
    rinfo.id = ecdsa.publicKeyConvert(ecdsa.recoverSync(signHash, signature, recovery), false).slice(1)
    const typeName = offsets[ethUtil.bufferToInt(type)]
    const parsed = parse[typeName](data)
    var contact = this.kBucket.get(rinfo.id)
    // if we don't konw about the peer, ping it
    if (!contact && typeName !== 'pong' && typeName !== 'ping') {
      this.ping(rinfo)
    }

    /**
     * Fires when receiving a neighbors. Provides a parsed neighbors packets and the peer it came from
     * @event neighbors
     */

    /**
     * Fires when receiving a findNode. Provides a parsed findNode packet and the peer it came from
     * @event findNode
     */

    /**
     * Fires when receiving a Ping. Provides a parsed ping packets and the peer it came from
     * @event ping
     */

    /**
     * Fires when receiving a pong. Provides a parsed pong packets and the peer it came from
     * @event pong
     */

    this.emit(typeName, parsed, rinfo, hash)
  }
}

// send a packet
DPT.prototype.sendPacket = function (type, data, peer, cb) {
  // added expriation
  const t = Math.floor(new Date() / 1000) + 60
  data.push(ethUtil.intToBuffer(t))
  type = new Buffer([type])
  const typeData = Buffer.concat([type, rlp.encode(data)])
  const signHash = ethUtil.sha3(typeData)
  const sig = ecdsa.signSync(signHash, this.secKey)
  const recvId = new Buffer([sig.recovery])
  const hashData = Buffer.concat([sig.signature, recvId, typeData])
  const hash = ethUtil.sha3(hashData)
  const packet = Buffer.concat([hash, hashData])
  this.socket.send(packet, 0, packet.length, peer.port || peer.udpPort, peer.address, cb)
  return hash
}

/**
 * pings a peer and wait for the pong
 * @method ping
 * @param {Peer} peer
 * @param {Function} cb
 */
DPT.prototype.ping = function (peer, cb) {
  if (!cb) cb = function () {}

  peer.udpPort = peer.udpPort || peer.port
  peer.tcpPort = peer.tcpPort || peer.port

  const self = this
  var toID
  var hash

  if (peer.address === '0.0.0.0') {
    peer.address = '127.0.0.1'
  }

  function recFunc (pong, rpeer) {
    if (peer.udpPort === rpeer.port && peer.address === rpeer.address) {
      clearTimeout(toID)
      self.removeListener('pong', recFunc)
      if (pong.hash.toString('hex') !== hash.toString('hex')) {
        cb(new Error('invalid hash in pong'), rpeer)
      } else {
        // add peer to kBucket
        rpeer.address = peer.address
        rpeer.udpPort = peer.udpPort
        rpeer.tcpPort = peer.udpPort
        self.kBucket.add(rpeer)
        cb(undefined, rpeer)
      }
    }
  }

  this.on('pong', recFunc)
  hash = this._ping(peer)

  toID = setTimeout(function () {
    self.removeListener('pong', recFunc)
    self.kBucket.remove(peer)
    cb('peer timed out')
  }, this.timeout)
}

/**
 * Sends the Finds nodes packet and waits for a response
 * @method findNodes
 * @param {Buffer} id
 * @param {Peer} peer
 */
DPT.prototype.findNodes = function (id, peer, cb) {
  var self = this
  var toID

  if (!cb) cb = function () {}

  function recFunc (neighbors, rpeer) {
    // dont talk about ourselves
    neighbors = neighbors.filter(function (n, i) {
      return n.id.toString('hex') !== self.id.toString('hex')
    })

    clearTimeout(toID)
    self.removeListener('neighbors', recFunc)
    cb(null, neighbors, rpeer)
  }

  this.on('neighbors', recFunc)
  this._findNodes(id, peer)

  toID = setTimeout(function () {
    self.removeListener('neighbors', recFunc)
    self.kBucket.remove(peer)
    cb('timed out', [])
  }, this.timeout)
}

// send a ping
// returns that hash
DPT.prototype._ping = function (peer, cb) {
  var srcAddress = this.publicAddress === '0.0.0.0' ? '127.0.0.1' : this.publicAddress
  const data = [
    new Buffer([this.version]),
    [createIp(srcAddress), ethUtil.intToBuffer(this.publicUdpPort), ethUtil.intToBuffer(this.tcpPort)],
    // TODO: fix destination tcpPort if possible
    [createIp(peer.address), ethUtil.intToBuffer(peer.udpPort), ethUtil.intToBuffer(peer.tcpPort)]
  ]
  return this.sendPacket(1, data, peer, cb)
}

// send a pong given a ping
DPT.prototype._pong = function (hash, peer, cb) {
  const data = [
    [createIp(this.address), ethUtil.intToBuffer(peer.udpPort), ethUtil.intToBuffer(peer.udpPort)],
    hash
  ]
  this.sendPacket(2, data, peer, cb)
}

// send the `findNode` message
DPT.prototype._findNodes = function (id, peer, cb) {
  const data = [id]
  this.sendPacket(3, data, peer, cb)
}

// sends the neighbors packets given an array of neighbors
DPT.prototype._neighbors = function (neighbors, peer, cb) {
  var ndata = []

  neighbors.forEach(function (n) {
    ndata.push([
      createIp(n.address),
      ethUtil.intToBuffer(n.udpPort),
      ethUtil.intToBuffer(n.tcpPort),
      n.id])
  })

  this.sendPacket(4, [ndata], peer, cb)
}

/**
 * Does a recusive `findNodes` for an given ID
 * @method findPeerrs
 * @param {String} id the id to search for
 * @param {Function} cb
 */
DPT.prototype.findPeers = function (id, cb) {
  var queried = {}
  var self = this

  lookup(function () {
    var peers = self.kBucket.closest({
      id: id
    }, self.K)
    cb(null, peers)
  })

  function lookup (cb2) {
    var cpeer = self.kBucket.closest({
      id: id
    }, self.K).filter(function (contact) {
      return !queried[contact.id.toString('hex')]
    })

    async.each(cpeer, function (peer, cb3) {
      query(peer, cb3)
    }, cb2)
  }

  function query (peer, cb2) {
    queried[peer.id.toString('hex')] = true
    self.concurrencySem.take(function () {
      self.findNodes(id, peer, function (err, neighbors) {
        if (err) return cb2(err)
        self.concurrencySem.leave()
        async.each(neighbors, function (n, done) {
          if (self.kBucket.get(n.id)) {
            done()
          } else {
            self.ping(n, done)
          }
        }, function () {
          lookup(cb2)
        })
      })
    })
  }
}

/**
 * connects to an array of nodes. Then does a recusive `lookup` on `this.id` to populate
 * the table.
 * @method bootStrap
 * @param {Array.<Peer>} peers and array of peers (POJO containing ip & port) to connect to
 * @param {Function} cb
 */
DPT.prototype.bootStrap = function (peers, cb) {
  var self = this
  async.each(peers, function (p, cb2) {
    self.ping(p, cb2)
  }, function () {
    self.findPeers(self.id, cb)
  })
}

/**
 * @method addPeer
 * @param {Object} peer and array of peers (POJO containing ip,  port and id) to connect to
 */
DPT.prototype.addPeer = function (peer) {
  assert(peer.id)
  assert(peer.udpPort)
  assert(peer.address)
  this.kBucket.add(peer)
}

/**
 * refreshes a the peers by asking them for more peers
 * @method refresh
 */
DPT.prototype.refresh = function () {
  var self = this
  var peers = this.kBucket.toArray()
  peers.forEach(function (p) {
    self.findNodes(p.id, p)
  })
}
