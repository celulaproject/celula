'use strict'

const validator = require('validator')

function gceOpts (json) {
  //   credentials: 'gce credentials json',
  //   projectId: '',
  //   zone: 'zone where the machine should be created',
  //   vmName: 'vm name to be given',
  //   machineType: 'machine type name',
  //   repositoryUrl: 'url of script to be executed at the end of startup',
  //   keys: 'keys to sign message that states the identity of this celula family'
  // }
  if (json.credentials &&
     json.credentials.client_email &&
     json.credentials.private_key &&
     json.projectId &&
     json.keys &&
     (json.machineType.indexOf('n1') === 0 || json.machineType.indexOf('g1') === 0)) {
    return true
  } else {
    return false
  }
}

function celulaGen (string) {
  let splitted = string.split(':')
  if (splitted[0] === 'gen' && Number.isInteger(Number(splitted[1]))) {
    return true
  } else {
    return false
  }
}

validator.gceOpts = gceOpts
validator.celulaGen = celulaGen

module.exports = validator
