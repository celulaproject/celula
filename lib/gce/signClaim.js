'use strict'

const request = require('superagent')
const signatures = require('sodium-signatures')
const level = require('level')

// get a signed claim for registration at celula register
function signClaim (gce, vm, opts) {
  return new Promise((resolve, reject) => {
    // get instance IP
    gce.zone(vm.zone.id)
    .vm(vm.name)
    .getMetadata()
    .then((value) => {
      let networkInterface = value[0].networkInterfaces
      if (networkInterface.length > 1) {
        return reject(new Error('tooManyNetworkInterfaces'))
      }
      let accessConfigs = networkInterface[0].accessConfigs
      if (accessConfigs.length > 1) {
        return reject(new Error('tooManyAccessConfigs'))
      }
      if (!(accessConfigs[0].name === 'external-nat' && accessConfigs[0].type === 'ONE_TO_ONE_NAT')) {
        return reject(new Error('invalidAccessConfigs'))
      }
      let IP = accessConfigs[0].natIP

      getDestinationId(IP, null, function (err, res) {
        if (err) {
          // this error is never launched...do it after X requests
          return reject(err)
        }
        let claimId = 'claim:' + opts.uuid
        let destGeneration = Number(opts.keys.generation.split(':')[1]) + 1

        let claimMessage = {
          source: {
            publicKey: opts.keys.publicKey.toString('base64'),
            generation: opts.keys.generation,
            celulaVersion: require('../../package.json').version
          },
          destination: {
            ip: IP,
            publicKey: res.publicKey,
            generation: 'gen:' + destGeneration,
            repositoryUrl: opts.repositoryUrl
          }
        }

        let claim = {
          date: new Date().toISOString(),
          message: claimMessage,
          signature: signatures.sign(Buffer.from(JSON.stringify(claimMessage)), opts.keys.secretKey).toString('base64')
        }

        const db = level('./db', {valueEncoding: 'json'})
        let dbError = null

        db.put(claimId, claim, (err) => {
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
            resolve({id: opts.uuid, claim: claim})
          })
        })
      })
    })
    .catch((err) => {
      reject(err)
    })
  })
}

function _pollDestination (ip, response, callback, loopfunction) {
  console.log('polling', ip)
  if (!response) {
    request
    .get('https://' + ip + ':3141/id')
    .end(function (err, res) {
      if (err) {
        setTimeout(() => {
          loopfunction(ip, null, callback, loopfunction)
        }, 10000)
      } else {
        setTimeout(() => {
          loopfunction(ip, res, callback, loopfunction)
        }, 10000)
      }
    })
  } else {
    callback(null, {publicKey: response.body.publicKey})
  }
}

function getDestinationId (ip, id, callback) {
  _pollDestination(ip, id, callback, _pollDestination.bind(this))
}

module.exports = signClaim
