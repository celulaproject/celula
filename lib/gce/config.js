'use strict'

const fs = require('fs')
const path = require('path')
const validator = require('validator')
const crypto = require('crypto')
const uuid = require('uuid')

function config (opts) {
  return new Promise((resolve, reject) => {
    if (opts.repositoryUrl && !(validator.isURL(opts.repositoryUrl) && opts.repositoryUrl.lastIndexOf('.sh') === (opts.repositoryUrl.length - 3))) {
      reject(new Error('invalidRepositoryUrl'))
    }

    fs.readFile(path.join(__dirname, 'startup-script.sh'), 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        data = data.replace(/_CELULA_NEXT_GENERATION_/g, 'gen:' + (Number(opts.keys.generation.split(':')[1]) + 1))
        if (opts.repositoryUrl) {
          data = data.replace(/_REPO_URL_/g, opts.repositoryUrl).replace(/#_install_script_/g, 'install_script')
        }
        // disk options
        let diskSizeGb = opts.diskSizeGb ? opts.diskSizeGb : '10'
        let diskType = 'projects/' + opts.credentials.project_id + '/zones/' + opts.zone + '/diskTypes/'
        diskType += opts.diskType ? opts.diskType : 'pd-standard'
        let diskRawKey = crypto.randomBytes(32).toString('base64')
        let diskName = 'celula-disk-' + uuid.v4()

        let response = {
          'https': true,
          'http': true,
          'disks': [{
            'kind': 'compute#attachedDisk',
            'boot': true,
            'initializeParams': {
              'diskName': diskName,
              'diskSizeGb': diskSizeGb,
              'diskType': diskType,
              'sourceImage': 'projects/debian-cloud/global/images/family/debian-8'
            },
            'autoDelete': true,
            'diskEncryptionKey': {
              'rawKey': diskRawKey
            }
          }],
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
