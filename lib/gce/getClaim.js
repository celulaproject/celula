'use strict'

const nodeIpc = require('node-ipc')

// get a signed claim for registration at celula register
function getClaim (gce, vm) {
  return new Promise((resolve, reject) => {
    // get instance IP
    gce.zone(vm.zone.id)
    .vm(vm.name)
    .getMetadata()
    .then((value) => {
      let networkInterface = value[0].networkInterfaces
      if (networkInterface.length > 1) {
        reject(new Error('tooManyNetworkInterfaces'))
      }
      let accessConfigs = networkInterface[0].accessConfigs
      if (accessConfigs.length > 1) {
        reject(new Error('tooManyAccessConfigs'))
      }
      if (!(accessConfigs[0].name === 'external-nat' && accessConfigs[0].type === 'ONE_TO_ONE_NAT')) {
        reject(new Error('invalidAccessConfigs'))
      }
      let IP = accessConfigs[0].natIP
      // get signed claim from main process using nodeIpc

      resolve(IP)
    })
    .catch((err) => {
      reject(err)
    })
  })
}

module.exports = getClaim
