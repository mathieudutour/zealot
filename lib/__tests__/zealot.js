/* globals test expect afterAll */

const zealot = require('../')

afterAll(() => zealot.close())

test('zealot.open', async () => {
  const db = await zealot.open('localhost/zealot-test')
  expect(db).toBeTruthy()
})

test('zealot.collection.method()', async () => {
  const user = await zealot.users.insert({username: 'foo'})
  expect(user.ops[0].username).toBe('foo')
})

test('zealot.collection._id.method()', async () => {
  const user = await zealot.users.findOne()
  await zealot.users[user._id].update({username: 'bar'})
  expect(await zealot.users[user._id].findOne()).toEqual({username: 'bar', _id: user._id})
})
