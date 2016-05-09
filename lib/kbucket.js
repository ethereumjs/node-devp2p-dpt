const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const _KBucket = require('k-bucket')

const KBUCKET_SIZE = 16
const KBUCKET_CONCURRENCY = 3

function KBucket (id) {
  EventEmitter.call(this)

  this._kbucket = new _KBucket({
    localNodeId: id,
    numberOfNodesPerKBucket: KBUCKET_SIZE,
    numberOfNodesToPing: KBUCKET_CONCURRENCY,
    ping: this.emit.bind(this, 'ping')
  })
}

inherits(KBucket, EventEmitter)

KBucket.prototype.add = function (peer) {
  // return if already in bucket
  if (this._kbucket.get(peer.id) !== null) return
  // add to bucket
  this._kbucket.add(peer)
  // emit `add` if peer was added
  if (this._kbucket.get(peer.id) !== null) this.emit('add', peer)
}

KBucket.prototype.get = function (id) {
  return this._kbucket.get(id)
}

KBucket.prototype.getAll = function () {
  return this._kbucket.toArray()
}

KBucket.prototype.closest = function (id) {
  return this._kbucket.closest({ id }, KBUCKET_SIZE)
}

KBucket.prototype.remove = function (peer) {
  // return if peer not exists
  if (this._kbucket.get(peer.id) === null) return
  // remove from bucket
  this._kbucket.remove(peer)
  // emit event
  this.emit('remove', peer)
}

module.exports = KBucket
