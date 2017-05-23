const { ObjectId, MongoClient } = require('mongodb')
const EventEmitter = require('events')
const Collection = require('./collection')
const { STATE } = require('./constants')
class DBEmitter extends EventEmitter {}

const NATIVE_EVENTS = ['authenticated', 'close', 'error', 'fullsetup', 'parseError', 'reconnect', 'timeout']

const DEFAULT_OPTIONS = {
  safe: true,
  castIds: true,
  wrapNon$UpdateField: true,
  middlewares: [
    require('../middlewares/wait-for-connection')
  ]
}

const emitter = new DBEmitter()

const collections = {}
let _collectionOptions = DEFAULT_OPTIONS
let _connectionURI
let _connectionOptions
let state = STATE.CLOSED
let db

const Zealot = new Proxy({}, {
  get (target, property, receiver) {
    switch (property) {
      case 'open':
        return open
      case 'reconnect':
        return reconnect
      case 'getState':
        return () => state
      case 'getDB':
        return () => db
      case 'close':
        return close
      case 'addMiddleware':
        return addMiddleware
      case 'id':
        return ObjectId

      // event listener method
      case 'on':
        return emitter.on
      case 'once':
        return emitter.once
      case 'off':
        return emitter.off
      case '_events':
        return emitter._events
      case '_maxListeners':
        return emitter._maxListeners
      case '_eventsCount':
        return emitter._eventsCount

      // collections
      default:
        if (typeof property !== 'string') {
          return {db, state}
        }
        if (!collections[property]) {
          collections[property] = new Collection(Zealot, property, _collectionOptions)
        }
        return collections[property]
    }
  },
  // handle `delete zealot.users`
  deleteProperty (target, property) {
    if (!collections[property]) {
      collections[property] = new Collection(Zealot, property, _collectionOptions)
    }
    return collections[property].drop().then((res) => {
      delete collections[property]
      return res
    })
  }
})

function open (uri, options) {
  if (!uri) {
    throw Error('No connection URI provided.')
  }

  options = options || {}

  _collectionOptions = Object.assign(_collectionOptions, options.collectionOptions || {})
  delete options.collectionOptions

  if (Array.isArray(uri)) {
    if (!options.database) {
      for (var i = 0, l = uri.length; i < l; i++) {
        if (!options.database) {
          options.database = uri[i].replace(/([^\/])+\/?/, '') // eslint-disable-line
        }
        uri[i] = uri[i].replace(/\/.*/, '')
      }
    }
    uri = uri.join(',') + '/' + options.database
  }

  if (typeof uri === 'string') {
    if (!/^mongodb:\/\//.test(uri)) {
      uri = 'mongodb://' + uri
    }
  }

  _connectionURI = uri
  _connectionOptions = options

  state = STATE.OPENING

  MongoClient.connect(uri, options, (err, _db) => {
    if (err || !_db) {
      state = STATE.CLOSED
      emitter.emit('error-opening', err)
      return
    }

    state = STATE.OPEN
    db = _db

    // set up events
    NATIVE_EVENTS.forEach((eventName) => {
      _db.on(eventName, (e) => emitter.emit(eventName, e))
    })

    emitter.emit('open', db)
  })

  return new Promise((resolve, reject) => {
    emitter.once('open', resolve)
    emitter.once('error-opening', reject)
  })
}

function reconnect () {
  return open(_connectionURI, _connectionOptions)
}

function close (force = false) {
  function _close (resolve, _db) {
    _db.close(force, function () {
      state = STATE.CLOSED
      resolve()
    })
  }

  switch (state) {
    case STATE.CLOSED:
      return Promise.resolve()
    case STATE.OPENING:
      return new Promise((resolve) => {
        emitter.on('open', (_db) => _close(resolve, _db))
      })
    case STATE.OPEN:
    default:
      return new Promise(function (resolve) {
        _close(resolve, db)
      })
  }
}

function addMiddleware (middleware) {
  if (!_collectionOptions) {
    _collectionOptions = {}
  }
  if (!_collectionOptions.middlewares) {
    _collectionOptions.middlewares = []
  }
  _collectionOptions.middlewares.push(middleware)

  Object.keys(collections).forEach((k) => {
    collections[k].addMiddleware(middleware)
  })
}

module.exports = Zealot
