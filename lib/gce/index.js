'use strict'

const gcloud = require('google-cloud')

const createHost = require('./createHost')
const createFirewall = require('./createFirewall')
const getConfig = require('./config.js')
const signClaim = require('./signClaim')
const validator = require('./utils/validator')

function run (opts) {
  // opts object contains
  // {
  //   credentials: 'gce credentials json',
  //   projectId: '',
  //   zone: 'zone where the machine should be created',
  //   vmName: 'vm name to be given',
  //   machineType: 'machine type name',
  //   repositoryUrl: 'url of script to be executed at the end of startup',
  //   keys: 'keys to sign message that states the identity of this celula family'
  // }

  return new Promise((resolve, reject) => {
    if (!validator.gceOpts(opts)) {
      return reject(new Error('invalidOpts'))
    }

    const gce = gcloud.compute({
      projectId: opts.projectId,
      credentials: opts.credentials
    })
    const zone = gce.zone(opts.zone)

    createFirewall(gce)
    .then((value) => {
      console.log('createFirewall:response:', value)
      getConfig(opts.repositoryUrl)
      .then((config) => {
        console.log('getConfig:response:', config)
        createHost(zone, opts, config)
        .then((vm) => {
          console.log('createHost:response:', vm)
          // get registration claim for celula-register
          signClaim(gce, vm, opts.keys)
          .then((data) => {
            console.log('signClaim:response:', data)
            resolve(data)
          })
          .catch((err) => {
            console.log('signClaim:error:', err)
            reject(err)
          })
        })
        .catch((err) => {
          console.log('createHost:error:', err)
          reject(err)
        })
      })
      .catch((err) => {
        console.log('getConfig:error:', err)
        reject(err)
      })
    })
    .catch((err) => {
      console.log('firewall:error:', err)
      reject(err)
    })
  })
}

module.exports = run
