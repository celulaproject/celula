'use strict'

const fs = require('fs')
const path = require('path')
const validator = require('validator')

function config (url = null) {
  return new Promise((resolve, reject) => {
    if (url && !(validator.isURL(url) && url.lastIndexOf('.sh') === (url.length - 3))) {
      reject(new Error('invalidUrl'))
    }

    fs.readFile(path.join(__dirname, 'startup-script.sh'), 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        if (url) {
          data = data.replace(/_REPO_URL_/g, url).replace(/#_install_script_/g, 'install_script')
        }

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
                'key': 'shutdown-script',
                'value': ''
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
