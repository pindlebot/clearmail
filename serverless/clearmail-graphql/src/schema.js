const fs = require('fs')
const path = require('path')
const { makeExecutableSchema } = require('apollo-server-lambda')
const resolvers = require('./resolvers')
const typeDefs = fs.readFileSync(path.join(__dirname, './schema.graphql'), { encoding: 'utf8' })

const DefaultDirective = require('./directives/DefaultDirective')
const AuthDirective = require('./directives/AuthDirective')

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: {
    default: DefaultDirective,
    auth: AuthDirective
  }
})

module.exports = schema
