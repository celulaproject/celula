const level = require('level')
const through2 = require('through2')
const validator = require('validator')

function getClaims (uuid) {
  return new Promise((resolve, reject) => {
    let db = null
    let dbError = null
    if (uuid === 'all') {
      db = level('./db', {valueEncoding: 'json'})
      // get a full list of saved claims
      let result = []
      db.createReadStream()
      .pipe(through2.obj(function (chunk, enc, next) {
        if (chunk.key.indexOf('claim') < 0) {
          next()
        } else {
          chunk.key = chunk.key.split(':')[1]
          this.push({id: chunk.key, claim: chunk.value})
          next()
        }
      }))
      .on('data', (data) => {
        result.push(data)
      })
      .on('error', function (err) {
        console.err(err)
        dbError = err
      })
      .on('end', () => {
        db.close((err) => {
          if (err) {
            console.err(err)
          }
          if (dbError) {
            return reject(dbError)
          }
          resolve(result)
        })
      })
    } else if (validator.isUUID(uuid)) {
      db = level('./db', {valueEncoding: 'json'})
      db.get('claim:' + uuid, (err, value) => {
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
          resolve({id: uuid, claim: value})
        })
      })
    } else {
      reject({statusCode: 400, message: 'invalidUUID'})
    }
  })
}

module.exports = getClaims
