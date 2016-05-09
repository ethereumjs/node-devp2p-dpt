const async = require('async')
const secp256k1 = require('secp256k1')
const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const randombytes = require('randombytes')
const debug = require('debug')('devp2p-dpt:dpt')
const KBucket = require('./kbucket')
const Network = require('./network')

function DPT (options) {
  EventEmitter.call(this)

  this._privateKey = options.privateKey
  this._id = secp256k1.publicKeyCreate(this._privateKey, false).slice(1)

  this._kbucket = new KBucket(this._id)
  this._kbucket.on('add', (peer) => this.emit('peer:add', peer))
  this._kbucket.on('remove', (peer) => this.emit('peer:remove', peer))
  this._kbucket.on('ping', (oldPeers, newPeer) => {
    for (let peer of oldPeers) {
      this._network.sendPing(peer, (err) => {
        if (err == null) return
        this._kbucket.remove(peer)
        this._kbucket.add(newPeer)
      })
    }
  })

  this._network = new Network(this, {
    privateKey: this._privateKey,
    createSocket: options.createSocket,
    timeout: options.timeout,
    endpoint: options.endpoint
  })
  this._network.on('error', this.emit.bind(this, 'error'))

  this._refreshId = null
  this._refreshIntervial = options.refreshIntervial || 300000
}

inherits(DPT, EventEmitter)

DPT.prototype.start = function () {
  // bind socket only if not binded yet
  if (this._network.isActive()) return
  this._network.start()
  // call refresh with this._refreshInterval
  this._refreshId = setInterval(() => {
    this.refresh(this.getPeers(), (err, results) => {
      if (err) return this.emit('error', err)

      // emit errors
      for (let result of results) {
        if (result[0] !== null) this.emit('error', result[0])
      }
    })
  }, this._refreshIntervial)
}

DPT.prototype.stop = function () {
  if (!this._network.isActive()) return

  // clear refresh interval immediately
  clearInterval(this._refreshId)
  this._refreshId = null

  // close socket
  this._network.stop()
}

DPT.prototype.bootstrap = function (peers, callback) {
  debug(`bootstrap with peers: ${JSON.stringify(peers)}`)
  // add peers first
  this.addPeers(peers, (err, results) => {
    if (err) return callback(err)
    async.map(results, (result, cb) => {
      // check that peer was added
      if (result[0] !== null) return cb(null, [ result[0] ])
      // send findneightbours
      this._network.sendFindNeighbours(result[1], this._id, (err) => cb(null, [ err ]))
    }, callback)
  })
}

DPT.prototype.addPeers = function (peers, callback) {
  debug(`add peers: ${JSON.stringify(peers)}`)
  async.map(peers, (peer, cb) => {
    // check peer in bucket
    if (peer.id) {
      let obj = this._kbucket.get(peer.id)
      if (obj !== null) return cb(null, [ null, obj ])
    }

    // check that peer is alive
    this._network.sendPing(peer, (err, peer) => {
      if (err === null) this._kbucket.add(peer)
      cb(null, [ err, peer ])
    })
  }, callback)
}

DPT.prototype.getPeer = function (id) {
  return this._kbucket.get(id)
}

DPT.prototype.getPeers = function () {
  return this._kbucket.getAll()
}

DPT.prototype.getClosestPeers = function (id) {
  return this._kbucket.closest(id)
}

DPT.prototype.removePeers = function (peers) {
  for (let peer of peers) this._kbucket.remove(peer)
}

DPT.prototype.refresh = function (peers, callback) {
  debug(`call .refresh for ${peers.length} peers`)

  async.map(peers, (peer, cb) => {
    this._network.sendFindNeighbours(peer, randombytes(64), (err) => cb(null, [ err ]))
  }, callback)
}

module.exports = DPT
