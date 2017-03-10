'use strict'

const signatures = require('sodium-signatures')
const identity = require('./lib/identity')
const replicate = require('./lib/gce/index')
const getClaims = require('./lib/getClaims')
const replicationRequest = require('./lib/replicationRequest')

const uuid = require('uuid')
const https = require('https')
const selfsigned = require('selfsigned')
const Koa = require('koa')
const _ = require('koa-route')
const bodyParser = require('koa-bodyparser')
const app = new Koa()
app.use(bodyParser())

const generation = process.env.CELULA_GEN ? process.env.CELULA_GEN : 'gen:0'
let keys = null

const celula = {
  getId: (ctx) => {
    ctx.body = {
      publicKey: keys.publicKey.toString('base64'),
      generation: keys.generation
    }
  },
  getClaims: (ctx, uuid) => {
    return getClaims(uuid)
    .then((value) => {
      ctx.body = value
    })
    .catch((err) => {
      if (err && err.notFound) {
        return ctx.throw(404)
      }
      if (err && err.statusCode) {
        return ctx.throw(err.statusCode, err.message)
      }
      return ctx.throw(500, err)
    })
  },
  sign: (ctx) => {
    let signature = signatures.sign(Buffer.from(JSON.stringify(ctx.request.body)), keys.secretKey)
    ctx.body = signature.toString('base64')
  },
  verify: (ctx) => {
    let verified = signatures.verify(Buffer.from(JSON.stringify(ctx.request.body.claim)), Buffer.from(ctx.request.body.signature, 'base64'), keys.publicKey)
    ctx.body = verified
  },
  replicate: (ctx) => {
    ctx.request.body.keys = keys
    ctx.request.body.uuid = uuid.v4()
    // return inmediately with replication request id and then process
    return replicationRequest.save(ctx.request.body, 'processing')
    .then((data) => {
      ctx.body = data
      replicate(ctx.request.body)
      .then((value) => {
        replicationRequest.save(ctx.request.body, 'success')
      })
      .catch((err) => {
        replicationRequest.save(ctx.request.body, err.toString())
      })
    })
    .catch((err) => {
      return ctx.throw(500, err)
    })
  },
  getReplicationRequest: (ctx, uuid) => {
    return replicationRequest.get(uuid)
    .then((value) => {
      ctx.body = value
    })
    .catch((err) => {
      if (err && err.notFound) {
        return ctx.throw(404)
      }
      if (err && err.statusCode) {
        return ctx.throw(err.statusCode, err.message)
      }
      return ctx.throw(500, err)
    })
  }
}

app.use(_.get('/id', celula.getId))
app.use(_.get('/claims/:uuid', celula.getClaims))
app.use(_.get('/replicate/:uuid', celula.getReplicationRequest))
app.use(_.post('/sign', celula.sign))
app.use(_.post('/verify', celula.verify))
app.use(_.post('/replicate', celula.replicate))

identity(generation)
.then((value) => {
  keys = value
  // create ssl certs and server
  let pems = selfsigned.generate([{ name: 'commonName', value: 'celula' }], { days: 10000 })
  https.createServer({
    key: pems.private,
    cert: pems.cert
  }, app.callback()).listen(3141)
  console.log('listening over https on port 3141')
})
.catch((err) => {
  console.error('identityError:', err)
})
