const level = require('level')
const validator = require('validator')

function save (opts, data) {
  return new Promise((resolve, reject) => {
    if (!validator.gceOpts(opts)) {
      return reject(new Error('invalidOpts'))
    }

    let db = level('./db', {valueEncoding: 'json'})
    let dbError = null

    db.put('replicationRequest:' + opts.uuid, data, (err) => {
      if (err) {
        console.error(err)
        dbError = err
      }
      db.close((err) => {
        if (err) {
          console.error(err)
        }
        if (dbError) {
          return reject(dbError)
        }
        resolve({id: opts.uuid, message: data})
      })
    })
  })
}

function get (id) {
  return new Promise((resolve, reject) => {
    if (!validator.isUUID(id)) {
      return reject({statusCode: 400, message: 'invalidUUID'})
    }
    let dbError = null
    let db = level('./db', {valueEncoding: 'json'})
    db.get('replicationRequest:' + id, (err, value) => {
      if (err) {
        console.error(err)
        dbError = err
      }
      db.close((err) => {
        if (err) {
          console.err(err)
        }
        if (dbError) {
          return reject(dbError)
        }
        resolve({id: id, message: value})
      })
    })
  })
}

module.exports = {
  save: save,
  get: get
}
