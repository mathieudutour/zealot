const Document = function (zealot, collection, _id) {
  const documentProxy = new Proxy({zealot, collection, _id}, {
    // handle `zealot.users[_id].update`
    get (target, property, receiver) {
      return (...argumentsList) => collection[property]({_id}, ...argumentsList)
    },
    // handle `delete zealot.users[_id].temp`
    deleteProperty (target, property) {
      return collection.update({_id}, {$unset: {[property]: ''}})
    },
    // handle `zealot.users[_id].username = something`
    set (target, property, value, receiver) {
      return collection.update({_id}, {$set: {[property]: value}})
    }
  })

  return documentProxy
}

module.exports = Document
