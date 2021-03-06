'use strict'

const operationHandler = require('./utils/operationHandler')
// opts object contains
// {
//   credentials: 'gce credentials json',
//   projectId: '',
//   zone: 'zone where the machine should be created',
//   vmName: 'vm name to be given',
//   machineType: 'machine type name',
//   url: 'url of script to be executed at the end of startup',
//   diskSizeGb: 'Number repersenting GB, default to 10',
//   diskType: 'pd-ssd or pd-standard, default to standard'
// }

function createHost (zone, opts, vmConfig) {
  return new Promise((resolve, reject) => {
    // add optional params to vmConfig
    vmConfig.machineType = opts.machineType

    zone.createVM(opts.vmName, vmConfig)
    .then((data) => {
      operationHandler(data[1])
      .then((value) => {
        resolve(data[0])
      })
      .catch((err) => {
        reject(err)
      })
    })
    .catch((err) => {
      reject(err)
    })
  })
}

module.exports = createHost
