# Zealot

A futurist MongoDB library. Only works with NodeJS 7+.

## Installation

```
npm install --save zealot
```

## Usage

```js
const zealot = require('zealot')

zealot.open('localhost/test') // open the mongodb connection

// dispatch db.collection('users').findOne({username: 'foo'})
const user = await zealot.users.findOne({username: 'foo'})

// dispatch db.collection('users').update({_id: user._id}, {$set: {username: 'bar'}})
await (zealot.users[user._id].username = 'bar')
// or
await (zealot.users[user._id].update({$set: {username: 'bar'}}))
// or
await (zealot.users.update({_id: user._id}, {$set: {username: 'bar'}}))

// dispatch db.collection('users').update({_id: user._id}, {$unset: {temp: ''}})
await (delete zealot.users[user._id].temp)

// dispatch db.collection('users').deleteOne({_id: user._id})
await (delete zealot.users[user._id])

// dispatch db.collection('users').drop()
await (delete zealot.users)
```

## Licence

MIT
