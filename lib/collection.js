const applyMiddleware = require('./applyMiddlewares')
const Document = require('./document')

const Collection = function (zealot, name, options) {
  let _dispatch

  const nativeCall = (args, {method, nativeCollection}) => {
    return nativeCollection[method](...args)
  }

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
        case 'options':
          return options
        default:
          // handle `zealot.users[_id]`
          if (zealot.id.isValid(property)) {
            return new Document(zealot, collectionProxy, property)
          }
          // handle `zealot.users.find()`
          return (...argumentsList) => _dispatch(nativeCall)(argumentsList, {method: property, collection: collectionProxy})
      }
    },
    ownKeys (target) {
      return ['name', 'options']
    }
  })

  _dispatch = applyMiddleware(options.middlewares)(zealot)
  return collectionProxy
}

module.exports = Collection
