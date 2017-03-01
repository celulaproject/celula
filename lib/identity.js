'use strict'

const signatures = require('sodium-signatures')
const level = require('level')
const gen0Keys = signatures.keyPair()
const validator = require('./validator')

function identity (gen = 'gen:0') {
  return new Promise((resolve, reject) => {
    if (gen === 'gen:0') {
      gen0Keys.generation = 'gen:0'
      resolve(gen0Keys)
    } else {
      if (!validator.celulaGen(gen)) {
        return reject(new Error('invalidCelulaGeneration'))
      }
      // we can save to memory
      const db = level('./db', {valueEncoding: 'json'})
      let dbError = null
      db.get('keyPair', (err, value) => {
        if (err) {
          if (err.notFound) {
            // create key pair
            let keyPair = signatures.keyPair()
            keyPair.generation = gen
            db.put('keyPair', keyPair, (err) => {
              if (err) {
                console.error(err)
                dbError = err
              } else {
                db.close((err) => {
                  if (err) {
                    console.error(err)
                  }
                  if (dbError) {
                    return reject(dbError)
                  }
                  resolve(keyPair)
                })
              }
            })
          } else {
            db.close(() => {
              reject(err)
            })
          }
        } else {
          db.close((err) => {
            if (err) {
              console.error(err)
            }
            resolve({
              publicKey: Buffer.from(value.publicKey.data),
              secretKey: Buffer.from(value.secretKey.data),
              generation: value.generation
            })
          })
        }
      })
    }
  })
}

module.exports = identity
