# Zealot

A futurist MongoDB library. Only works with NodeJS 6+.

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
await (zealot.users[user._id].update({$set: {username: 'bar'}}))
// or
await (zealot.users.update({_id: user._id}, {$set: {username: 'bar'}}))
```

## Licence

MIT
