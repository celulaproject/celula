'use strict'

function createFirewall (gce) {
  //  Firewall setup for celula replication
  return new Promise((resolve, reject) => {
    let config = {
      protocols: {
        tcp: [3141]
      },
      ranges: ['0.0.0.0/0']
    }
    // It exists already?
    gce.firewall('celula-replication')
    .exists(function (err, exists) {
      if (err) {
        reject(err)
      } else if (exists) {
        resolve('firewallExists')
      } else {
        gce.createFirewall('celula-replication', config, callback)
      }
    })

    function callback (err, firewall, operation, apiResponse) {
      // `firewall` is a Firewall object.
      // `operation` is an Operation object that can be used to check the status
      // of the request.
      if (err) {
        reject(err)
      } else {
        resolve(apiResponse)
      }
    }

    gce.createFirewall('celula-replication', config, callback)
  })
}

module.exports = createFirewall
