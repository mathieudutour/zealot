module.exports = {
  aggregate: {
    stages: 0,
    options: 1
  },
  bulkWrite: {
    operations: 0,
    options: 1
  },
  count: {
    query: 0,
    options: 1
  },
  createIndex: {
    fields: 0,
    options: 1
  },
  distinct: {
    field: 0,
    query: 1,
    options: 2
  },
  drop: {},
  dropIndex: {
    fields: 0,
    options: 1
  },
  dropIndexes: {},
  find: {
    query: 0,
    options: 1
  },
  findOne: {
    query: 0,
    options: 1
  },
  findOneAndDelete: {
    query: 0,
    options: 1
  },
  findOneAndUpdate: {
    query: 0,
    update: 1,
    options: 2
  },
  group: {
    keys: 0,
    condition: 1,
    initial: 2,
    reduce: 3,
    finalize: 4,
    command: 5,
    options: 6
  },
  indexes: {},
  insert: {
    data: 0,
    options: 1
  },
  remove: {
    query: 0,
    options: 1
  },
  update: {
    query: 0,
    update: 1,
    options: 2
  }
}
