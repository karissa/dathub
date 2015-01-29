var sqliteSearch = require('sqlite-search')
var through = require('through2')
var changes = require('changes-feed')
var changeProcessor = require('level-change-processor')
var indexer = require('level-indexer')
var changesdown = require('changesdown')
var runSeries = require('run-series')
var debug = require('debug')('search-indexer')

module.exports = function (opts) {
  var searchIndexer = {
    path: opts.path,
    columns: opts.columns
  }

  sqliteSearch(searchIndexer, function(err, searcher) {
    if (err) return console.error('err', err)
    var writer = searcher.createWriteStream()

    // var keyIndexerStatement = "CREATE UNIQUE INDEX key_index on " + searcher.name + " (key)"

    // searcher.db.run(keyIndexerStatement, function (err) {
    //   if (err) return console.error('err', err)

    var processor = changeProcessor({
      db: opts.state,
      feed: opts.feed,
      worker: worker,
      key: 'latest-search-state'
    })

    // })

    function worker(change, cb) {
      if (!Buffer.isBuffer(change.value)) return cb(new Error(change.change + ' was not Buffer'))

      var decoded = changesdown.decode(change.value)

      if (decoded.key) {
        var keyString = decoded.key.toString()
      }

      if (decoded.value) {
        var val = JSON.parse(decoded.value)
      }

      if (decoded.type === 'put') {
        deleteCurrentIndex(keyString, function(err) {
          if (err) return cb(err)
          storeNewIndex(keyString, val, cb)
        })
      }

      if (decoded.type === 'del') {
        return deleteCurrentIndex(keyString, cb)
      }

      function deleteCurrentIndex(key, cb) {
        debug('search indexer deleting', key)
        var statement = 'DELETE FROM ' + searcher.name + ' WHERE ' + 'key = ?'
        searcher.db.run(statement, key, function(err) {
          if (err) return cb(err)
          cb()
        })
      }

      function storeNewIndex(key, val, cb) {
        debug('search indexer writing', key, val)
        val['key'] = key
        writer.write(val, function(err) {
          if (err) return cb(err)
          cb()
        })
      }
    }
  })
}