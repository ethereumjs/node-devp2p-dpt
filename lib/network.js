const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const dgram = require('dgram')
const debug = require('debug')('devp2p-dpt:network')
const types = require('./types')

const VERSION = 0x04

function Network (dpt, options) {
  EventEmitter.call(this)

  this._dpt = dpt
  this._privateKey = options.privateKey

  this._createSocket = options.createSocket || dgram.createSocket.bind(null, 'udp4')
  this._socket = null
  this._timeout = options.timeout || 60000
  this._endpoint = options.endpoint
  if (!this._endpoint) throw new TypeError(`Invalid endpoint: ${JSON.stringify(this._endpoint)}`)

  this._requests = {}
}

inherits(Network, EventEmitter)

Network.prototype.isActive = function () {
  return this._socket !== null
}

Network.prototype.start = function () {
  debug(`start at ${this._endpoint.address}:${this._endpoint.udpPort}`)

  // this._socket will be null if bind fail
  let socket = this._createSocket()
  socket.bind(this._endpoint.udpPort, this._endpoint.address)

  this._socket = socket
  this._socket.on('error', this.emit.bind(this, 'error'))
  this._socket.on('message', (msg, rinfo) => {
    try {
      this._onMessage(msg, rinfo)
    } catch (err) {
      this.emit('error', err)
    }
  })
}

Network.prototype.stop = function () {
  debug('close socket')

  // close socket and remove listeners
  let socket = this._socket
  this._socket = null
  socket.removeAllListeners()
  socket.close()
}

Network.prototype.sendPing = function (peer, callback) {
  let data = {
    version: VERSION,
    from: this._endpoint,
    to: {
      address: peer.address,
      udpPort: peer.udpPort || peer.port,
      tcpPort: peer.tcpPort || peer.port
    }
  }

  let hash = this._sendPacket(peer, 'ping', data, () => {})
  this._pushRequest(hash, peer, 'ping', callback)
}

Network.prototype.sendFindNeighbours = function (peer, peerId, callback) {
  this._sendPacket(peer, 'findneighbours', { id: peerId }, () => {})
  this._pushRequest(peer.id, peer, 'findneighbours', callback)
}

Network.prototype._createRequestTimeout = function (key, command) {
  return setTimeout(() => {
    debug(`${command} timeout for ${key}`)
    this._popRequests(key, (request) => request.callback(new Error(`Timeout error: ${command}`)))
  }, this._timeout)
}

Network.prototype._pushRequest = function (id, peer, command, callback) {
  let key = id.toString('hex')
  if (this._requests[key] === undefined) this._requests[key] = []
  this._requests[key].push({
    peer: peer,
    callback: callback,
    timeoutId: this._createRequestTimeout(key, command)
  })
}

Network.prototype._popRequests = function (id, callback) {
  let key = id.toString('hex')
  let requests = this._requests[key] || []
  delete this._requests[key]

  for (let request of requests) {
    clearTimeout(request.timeoutId)
    callback(request)
  }
}

Network.prototype._sendPacket = function (peer, typename, data, callback) {
  if (!this.isActive()) return callback(new Error('Connection is closed'))
  debug(`send ${typename} to ${peer.address}:${peer.port} (peerId: ${peer.id && peer.id.toString('hex')})`)

  let packet = types.packet.encode(typename, data, this._privateKey)
  this._socket.send(packet, peer.port, peer.address, callback)
  return packet.slice(0, 32)
}

Network.prototype._onMessage = function (msg, rinfo) {
  let info = types.packet.decode(msg)
  debug(`received ${info.typename} from ${rinfo.address}:${rinfo.port} (peerId: ${info.publicKey.toString('hex')})`)

  // add peer if not in our table
  let peer = this._dpt.getPeer(info.publicKey)
  if (peer === null && info.typename !== 'pong') {
    // prevent sending second ping
    setTimeout(() => {
      this._dpt.addPeers([{ address: rinfo.address, port: rinfo.port }], () => {})
    }, 10)
  }

  switch (info.typename) {
    case 'ping':
      let data = { to: this._endpoint, hash: msg.slice(0, 32) }
      rinfo.id = info.publicKey // show id in logs
      this._sendPacket(rinfo, 'pong', data, () => {})
      break

    case 'pong':
      this._popRequests(info.data.hash, (request) => {
        let peer = {
          id: info.publicKey,
          address: request.peer.address,
          port: request.peer.port,
          endpoint: {
            address: request.peer.address,
            udpPort: request.peer.udpPort || request.peer.port,
            tcpPort: request.peer.tcpPort || request.peer.port
          }
        }
        request.callback(null, peer)
      })
      break

    case 'findneighbours':
      let peers = this._dpt.getClosestPeers(info.publicKey)
      rinfo.id = info.publicKey // show id in logs
      this._sendPacket(rinfo, 'neighbours', { peers: peers }, () => {})
      break

    case 'neighbours':
      this._popRequests(info.publicKey, (request) => request.callback(null))
      this._dpt.addPeers(info.data.peers.map((peer) => {
        return { address: peer.endpoint.address, port: peer.endpoint.udpPort }
      }))
      break
  }
}

module.exports = Network
