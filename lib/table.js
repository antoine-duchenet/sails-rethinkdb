"use strict";
var r = require("rethinkdb")
var Query = require("./query")

module.exports = class Table {
  constructor(conn, name) {
    this.conn = conn
    this.table = r.db(conn.db).table(name)
    this.table.conn = conn // for native method
  }

  insert(data, cb) {
    this.table.insert(data, {returnChanges: true}).run(this.conn, (err, result) => {
      if (err) return cb(err)
      if (result.errors > 0) return cb(new Error(result.first_error))
      cb(null, result.changes[0].new_val)
    })
  }

  insertEach(data, cb) {
    if (data.length === 0)
      return cb(null, [])
    this.table.insert(data, {returnChanges: true}).run(this.conn, (err, result) => {
      if (err) return cb(err)
      if (result.errors > 0) return cb(new Error(result.first_error))
      cb(null, result.changes.map(v => v.new_val))
    })
  }

  find(query, cb) {
    Query.build(this.table, query).run(this.conn, (err, cursor) => {
      if (err) return cb(err)
      cursor.toArray(cb)
    })
  }

  update(query, data, cb) {
    Query.build(this.table, query).update(data, {returnChanges: true}).run(this.conn, (err, result) => {
      if (err) return cb(err)
      if (result.errors > 0) return cb(new Error(result.first_error))
      cb(null, result.changes[0].new_val)
    })
  }

  destroy(query, cb) {
    Query.build(this.table, query).delete({returnChanges: true}).run(this.conn, (err, result) => {
      if (err) return cb(err)
      if (result.errors > 0) return cb(new Error(result.first_error))
      cb(null, result.changes.map(v => v.old_val.id))
    })
  }

  count(query, cb) {
    Query.build(this.table, query).count().run(this.conn, (err, result) => {
      if (err) return cb(err)
      cb(null, result)
    })
  }
}
