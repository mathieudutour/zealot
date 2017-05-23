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
    // handle `delete zealot.users[_id]`
    deleteProperty (target, property) {
      if (zealot.id.isValid(property)) {
        return _dispatch(nativeCall)([{_id: property}], {method: 'deleteOne', collection: collectionProxy})
      }
      return delete target[property]
    },
    // handle `zealot.users[_id] = something`
    set (target, property, value, receiver) {
      if (zealot.id.isValid(property)) {
        return _dispatch(nativeCall)([{_id: property}, value], {method: 'update', collection: collectionProxy})
      }
      return target[property] = value // eslint-disable-line
    }
  })

  _dispatch = applyMiddleware(options.middlewares)(zealot)
  return collectionProxy
}

module.exports = Collection
