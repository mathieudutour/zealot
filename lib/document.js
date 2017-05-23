const Document = function (zealot, collection, _id) {
  const documentProxy = new Proxy({zealot, collection, _id}, {
    get (target, property, receiver) {
      // handle `zealot.users[_id].update`
      return (...argumentsList) => collection[property]({_id}, ...argumentsList)
    }
  })

  return documentProxy
}

module.exports = Document
