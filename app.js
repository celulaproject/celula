'use strict'

const signatures = require('sodium-signatures')
const identity = require('./lib/identity')
const replicate = require('./lib/gce/index')
const getClaims = require('./lib/getClaims')

const Koa = require('koa')
const _ = require('koa-route')
const bodyParser = require('koa-bodyparser')
const app = new Koa()
app.use(bodyParser())

const generation = process.argv[2]
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
    return replicate(ctx.request.body)
    .then((value) => {
      ctx.body = value
    })
    .catch((err) => {
      return ctx.throw(500, err)
    })
  }
}

app.use(_.get('/id', celula.getId))
app.use(_.get('/claims/:uuid', celula.getClaims))
app.use(_.post('/sign', celula.sign))
app.use(_.post('/verify', celula.verify))
app.use(_.post('/replicate', celula.replicate))

identity(generation)
.then((value) => {
  keys = value
  app.listen(3141)
  console.log('listening on port 3141')
})
.catch((err) => {
  console.error('identityError:', err)
})
