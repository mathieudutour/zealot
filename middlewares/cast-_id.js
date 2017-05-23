const argsMap = require('./_args-map')

var FIELDS_TO_CAST = ['operations', 'query', 'data', 'update']

module.exports = (zealot) => {
  function cast (obj) {
    if (Array.isArray(obj)) {
      return obj.map(cast)
    }

    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(function (k) {
        if (k === '_id' && obj._id) {
          if (obj._id.$in) {
            obj._id.$in = obj._id.$in.map(zealot.id)
          } else if (obj._id.$nin) {
            obj._id.$nin = obj._id.$nin.map(zealot.id)
          } else if (obj._id.$ne) {
            obj._id.$ne = zealot.id(obj._id.$ne)
          } else {
            obj._id = zealot.id(obj._id)
          }
        } else {
          obj[k] = cast(obj[k])
        }
      })
    }

    return obj
  }

  return (next) => (args, context) => {
    const map = argsMap[context.method]
    if (!map) {
      console.warn('Missing argument map for method ' + context.method)
      return next(args, context)
    }

    // const options = args[map.options]
    // if ((options || {}).castIds === false) {
    //   return next(args, context)
    // }

    FIELDS_TO_CAST.forEach(function (k) {
      if (typeof map[k] !== 'undefined' && args[map[k]]) {
        args[map[k]] = cast(args[map[k]])
      }
    })

    return next(args, context)
  }
}
