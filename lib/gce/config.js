'use strict'

const fs = require('fs')
const path = require('path')
const validUrl = require('valid-url')

function config (url) {
  return new Promise((resolve, reject) => {
    if (!(validUrl.isUri(url) && url.lastIndexOf('.sh') === (url.length - 3))) {
      reject(new Error('invalidUrl'))
    }

    fs.readFile(path.join(__dirname, 'startup-script.sh'), 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        data = data.replace(/_SCRIPT_URL_/g, url)
        let response = {
          'os': 'debian-8',
          'https': true,
          'http': true,
          'metadata': {
            'kind': 'compute#metadata',
            'items': [
              {
                'key': 'serial-port-enable',
                'value': '0'
              },
              {
                'key': 'block-project-ssh-keys',
                'value': 'TRUE'
              },
              {
                'key': 'startup-script',
                'value': data
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
