'use strict'

// opts object contains
// {
//   keyPath: 'full path to the keyFile',
//   projectId: '',
//   zone: 'zone where the machine should be created',
//   vmName: 'vm name to be given',
//   machineType: 'machine type name'
// }

function replicate (zone, opts, vmConfig) {
  return new Promise((resolve, reject) => {
    // add optional params to vmConfig
    vmConfig.machineType = opts.machineType

    function createVmCallback (err, vm, operation, apiResponse) {
      // `vm` is a VM object.
      // `operation` is an Operation object that can be used to check the
      // status of the request.
      if (err) {
        reject(err)
      } else {
        resolve(apiResponse)
      }
    }

    zone.createVM(opts.vmName, vmConfig, createVmCallback)
  })
}

module.exports = replicate
