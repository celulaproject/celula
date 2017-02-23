'use strict'

const fs = require('fs')
const path = require('path')

function config () {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'startup-script.sh'), 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        let response = {
          'os': 'debian-8',
          'https': true,
          'metadata': {
            'kind': 'compute#metadata',
            'items': [
              {
                'key': 'startup-script',
                'value': data
              },
              {
                'key': 'serial-port-enable',
                'value': '0'
              },
              {
                'key': 'block-project-ssh-keys',
                'value': 'TRUE'
              }
            ]
          }
        }
        resolve(response)
      }
    })
  })
}

module.exports = config
