'use strict'

const nodeIpc = require('node-ipc')
const request = require('superagent-promise')(require('superagent'), Promise)

// get a signed claim for registration at celula register
function signClaim (gce, vm) {
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
      // This is relevant only for gen >0 instances. gen0 does not sign any claim since it just launches gen 1 instances.
      // gen1 instances make a family tree foundation claim.
      // llevar un constante get de la identidad de la celula encargada de la replicacion. Cuando haya respuesta revisar las operaciones que se han realizado en la VM. Cuando tengo la identidad, y la lista de operaciones esta ok, puedo firmar el claim y registrarla como descendiente. Luego de eso recien se pueden intercambiar info de un lado a otro si lo quieren.


      resolve(IP)
    })
    .catch((err) => {
      reject(err)
    })
  })
}

module.exports = signClaim
