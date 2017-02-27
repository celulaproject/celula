'use strict'

const signatures = require('sodium-signatures')
const level = require('level')
const gen0Keys = signatures.keyPair()

function identity (gen = 'gen0') {
  return new Promise((resolve, reject) => {
    if (gen === 'gen0') {
      gen0Keys.generation = 'gen0'
      resolve(gen0Keys)
    } else {
      // we can save to memory
      const db = level('./db', {valueEncoding: 'json'})
      db.get('keyPair', (err, value) => {
        if (err) {
          if (err.notFound) {
            // create key pair
            let keyPair = signatures.keyPair()
            keyPair.generation = gen
            db.put('keyPair', keyPair, (err) => {
              if (err) {
                reject(err)
              } else {
                resolve(keyPair)
              }
            })
          } else {
            reject(err)
          }
        } else {
          resolve({
            publicKey: Buffer.from(value.publicKey.data),
            secretKey: Buffer.from(value.secretKey.data),
            generation: value.generation
          })
        }
      })
    }
  })
}

module.exports = identity
