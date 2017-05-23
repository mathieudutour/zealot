const { STATE } = require('../lib/constants')

let queue = []

function emptyQueue (db) {
  queue.forEach((cb) => cb(db))
  queue = []
}

module.exports = function waitForConnection (zealot) {
  zealot.on('open', emptyQueue)

  return (next) => (args, context) => {
    const state = zealot.getState()
    let p
    switch (state) {
      case STATE.OPEN:
        p = Promise.resolve(zealot.getDB())
        break
      case STATE.OPENING:
        p = new Promise((resolve) => {
          queue.push(resolve)
        })
        break
      case STATE.CLOSED:
      default:
        p = new Promise((resolve) => {
          queue.push(resolve)
          zealot.reconnect()
        })
    }
    return p.then(function (db) {
      return db.collection(context.collection.name)
    }).then(function (nativeCollection) {
      return next(args, Object.assign(context, {nativeCollection}))
    })
  }
}
