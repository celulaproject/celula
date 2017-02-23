'use strict'

const gcloud = require('google-cloud')
const replicate = require('./replicate')
const createFirewall = require('./createFirewall')
const getConfig = require('./config.js')

function run (opts) {
  // opts object contains
  // {
  //   keyPath: 'full path to the keyFile',
  //   projectId: '',
  //   zone: 'zone where the machine should be created',
  //   vmName: 'vm name to be given',
  //   machineType: 'machine type name',
  //   url: 'url of script to be executed at the end of startup'
  // }

  const gce = gcloud.compute({
    projectId: opts.projectId,
    keyFileName: opts.keyPath
  })
  const zone = gce.zone(opts.zone)

  createFirewall(gce)
  .then((value) => {
    console.log('createFirewall-resp', value)
    getConfig(opts.url)
    .then((config) => {
      console.log('getConfig-resp', config)
      replicate(zone, opts, config)
      .then((value) => {
        console.log('replicate-resp', value)
      })
      .catch((err) => {
        console.log('replicate-err', err)
      })
    })
    .catch((err) => {
      console.log('getConfig-err', err)
    })
  })
  .catch((err) => {
    console.log('firewall-err', err)
  })
}

module.exports = run
