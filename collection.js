const applyMiddleware = require('./applyMiddlewares')

const Collection = function (zealot, name, options) {
  let _dispatch

  const collectionProxy = new Proxy({name, options}, {
    get (target, property, receiver) {
      switch (property) {
        case 'addMiddleware': {
          const next = _dispatch
          return (middleware) => {
            _dispatch = (...args) => middleware(zealot)(next(...args))
          }
        }
        case 'name':
          return name
        default:
          return (...argumentsList) => _dispatch((args, {method, nativeCollection}) => {
            return nativeCollection[method](...args)
          })(argumentsList, {method: property, collection: collectionProxy})
      }
    }
  })

  _dispatch = applyMiddleware(options.middlewares)(zealot)
  return collectionProxy
}

module.exports = Collection
