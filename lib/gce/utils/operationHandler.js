'use strict'

function operationHandler (op) {
  return new Promise((resolve, reject) => {
    op.on('complete', (metadata) => {
      op.removeAllListeners()
      resolve()
    })

    op.on('error', (err) => {
      reject(err)
    })
  })
}

module.exports = operationHandler
