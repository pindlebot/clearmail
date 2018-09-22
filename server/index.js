const path = require('path')

require('dotenv').config({
  path: path.join(process.cwd(), '.env')
})
const { ApolloServer, makeExecutableSchema, gql } = require('apollo-server-koa')
const resolvers = require('./graphql/resolvers')
const DefaultDirective = require('./graphql/directives/DefaultDirective')
const AuthDirective = require('./graphql/directives/AuthDirective')
const fs = require('fs')
const verify = require('./token')
const typeDefs = fs.readFileSync(path.join(__dirname, './graphql/schema.graphql'), { encoding: 'utf8' })
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    default: DefaultDirective,
    auth: AuthDirective
  }
})
const jwt = require('jsonwebtoken')
const Koa = require('koa')
const koaBody = require('koa-body')

const server = new ApolloServer({
  schema,
  context: (context) => {
    let token = context.ctx.request.header.authorization.replace(/\s*[Bb]earer\s/, '')
    let { sub } = jwt.decode(token)
    context.user = sub
    return context
  }
})

const app = new Koa()
server.applyMiddleware({ app })

app.use(koaBody({
  jsonLimit: '1kb'
}))

app.use(async function (ctx, next) {
  if (ctx.path === '/token') {
    const body = ctx.request.body
    ctx.body = await verify(body)
  } else {
    next()
  }
})

app.use(async function (ctx, next) {
  if (ctx.path === '/graphql') {
    return next()
  }
  let type = path.extname(ctx.path)
  let fpath = path.join(__dirname, '../dist/', path.basename(ctx.path))
  if (type === '.ico') {
    fpath = path.join(__dirname, '../', path.basename(ctx.path))
  }
  if (!type) {
    type = '.html'
    fpath = path.join(__dirname, '../dist/index.html')
  }

  ctx.type = path.extname(fpath)
  ctx.body = fs.createReadStream(fpath)
})

const PORT = process.env.PORT || 4000

app.listen({ port: PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:${PORT}`)
)
