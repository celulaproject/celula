'use strict'

const gcloud = require('google-cloud')
const request = require('superagent-promise')(require('superagent'), Promise)

const createHost = require('./createHost')
const createFirewall = require('./createFirewall')
const getConfig = require('./config.js')
const signClaim = require('./signClaim')

const celulaRegisterUrl = 'https://register.celula.world/v1/register'

function run (opts) {
  // opts object contains
  // {
  //   keyPath: 'full path to the keyFile',
  //   projectId: '',
  //   zone: 'zone where the machine should be created',
  //   vmName: 'vm name to be given',
  //   machineType: 'machine type name',
  //   url: 'url of script to be executed at the end of startup',
  //   claim: 'signed message that states the identity of this celula family'
  // }

  const gce = gcloud.compute({
    projectId: opts.projectId,
    keyFileName: opts.keyPath
  })
  const zone = gce.zone(opts.zone)

  createFirewall(gce)
  .then((value) => {
    console.log('createFirewall:response:', value)
    getConfig(opts.url)
    .then((config) => {
      console.log('getConfig:response:', config)
      createHost(zone, opts, config)
      .then((vm) => {
        console.log('createHost:response:', vm)
        // get registration claim for celula-register
        signClaim(gce, vm)
        .then((data) => {
          console.log('signClaim:response:', data)
          // register
          request
          .post(celulaRegisterUrl)
          .send(data)
          .then((value) => {
            console.log('celulaRegister:response:', value)
          })
          .catch((err) => {
            console.log('celulaRegister:error:', err)
          })
        })
        .catch((err) => {
          console.log('signClaim:error:', err)
        })
      })
      .catch((err) => {
        console.log('createHost:error:', err)
      })
    })
    .catch((err) => {
      console.log('getConfig:error:', err)
    })
  })
  .catch((err) => {
    console.log('firewall:error:', err)
  })
}

module.exports = run
