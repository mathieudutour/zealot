var compose = require('./compose')

module.exports = function applyMiddleware (middlewares) {
  return function (middlewareAPI) {
    const chain = middlewares.map((middleware) => middleware(middlewareAPI))
    return compose(chain)
  }
}
